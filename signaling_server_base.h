#pragma once

#include <memory>
#include <string>
#include <unordered_set>

#include "manage_api.h"
#include "notification.h"
#include "signaling_handler.h"
#include "utils.h"

void HandleError(beast::error_code ec, char const* what);

struct SessionInfo {
  std::string room_id;
  std::string participant_id;
};

class WebsocketSessionSet;
class WebsocketSessionBase : public std::enable_shared_from_this<WebsocketSessionBase> {
 public:
  WebsocketSessionBase();
  virtual ~WebsocketSessionBase();
  virtual void SendText(const std::string& text) = 0;
  const SessionInfo& GetSessionInfo() const;
  virtual void Close() = 0;

 protected:
  void HandleWsError(beast::error_code ec, char const* what);
  SessionInfo session_info_;
  std::unique_ptr<SignalingHandler> signaling_handler_;
};

class WebsocketSessionSet {
 public:
  WebsocketSessionSet();

  void Join(WebsocketSessionBase* session);

  void Leave(WebsocketSessionBase* session);

  void Notify(const Notification& notification);

  void Clear();

 private:
  std::unordered_set<WebsocketSessionBase*> sessions_;
};

template <class DerivedClass>
class WebsocketSession : public WebsocketSessionBase {
 public:
  WebsocketSession(std::shared_ptr<WebsocketSessionSet> websocket_sessions) : websocket_sessions_{websocket_sessions} {
    websocket_sessions_->Join(this);
  }

  ~WebsocketSession() {
    websocket_sessions_->Leave(this);
  }

  template <class Body, class Allocator>
  void Run(http::request<Body, http::basic_fields<Allocator>> req) {
    DoAccept(std::move(req));
  }

  void SendText(const std::string& text) override {
    boost::beast::flat_buffer buffer;
    const auto n = boost::asio::buffer_copy(buffer.prepare(text.size()), boost::asio::buffer(text));
    buffer.commit(n);
    write_buffers_.push_back(std::move(buffer));

    if (write_buffers_.size() == 1)
      DoWrite();
  }

  void DoWrite() {
    auto& buffer = write_buffers_.front();
    Derived().Ws().text(true);
    Derived().Ws().async_write(
        buffer.data(),
        beast::bind_front_handler(&WebsocketSession::OnWrite, std::dynamic_pointer_cast<WebsocketSession<DerivedClass>>(shared_from_this())));
  }

  void Close() override {
    boost::system::error_code err;
    Derived().Ws().close(websocket::close_reason(websocket::close_code::normal), err);
  }

 private:
  std::vector<beast::flat_buffer> write_buffers_;
  std::shared_ptr<WebsocketSessionSet> websocket_sessions_;
  DerivedClass& Derived() {
    return static_cast<DerivedClass&>(*this);
  }

  boost::beast::multi_buffer read_buffer_;

  template <class Body, class Allocator>
  void DoAccept(http::request<Body, http::basic_fields<Allocator>> req) {
    Derived().Ws().set_option(websocket::stream_base::timeout::suggested(beast::role_type::server));
    Derived().Ws().set_option(websocket::stream_base::decorator(
        [](websocket::response_type& res) { res.set(http::field::server, std::string(BOOST_BEAST_VERSION_STRING) + " advanced-server-flex"); }));
    Derived().Ws().async_accept(
        req, beast::bind_front_handler(&WebsocketSession::OnAccept, std::dynamic_pointer_cast<WebsocketSession<DerivedClass>>(shared_from_this())));
  }

  void OnAccept(beast::error_code ec) {
    if (ec)
      return HandleWsError(ec, "accept");
    DoRead();
  }

  void DoRead() {
    Derived().Ws().async_read(read_buffer_, beast::bind_front_handler(&WebsocketSession::OnRead,
                                                                      std::dynamic_pointer_cast<WebsocketSession<DerivedClass>>(shared_from_this())));
  }

  void OnRead(beast::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);
    if (ec == websocket::error::closed)
      return HandleWsError(ec, "closed");

    if (ec)
      return HandleWsError(ec, "read");
    const auto signaling = boost::beast::buffers_to_string(read_buffer_.data());
    read_buffer_.consume(read_buffer_.size());
    SendText(signaling_handler_->HandleSignaling(signaling));
    DoRead();
  }

  void OnWrite(beast::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);
    if (ec)
      return HandleWsError(ec, "write");
    write_buffers_.erase(write_buffers_.begin());

    if (!write_buffers_.empty()) {
      DoWrite();
    }
  }
};

template <class DerivedClass>
class HttpSession {
  // Access the derived class, this is part of
  // the Curiously Recurring Template Pattern idiom.
  DerivedClass& Derived() {
    return static_cast<DerivedClass&>(*this);
  }

  // This queue is used for HTTP pipelining.
  class Queue {
    enum {
      // Maximum number of responses we will queue
      limit = 8
    };

    // The type-erased, saved work item
    struct Work {
      virtual ~Work() = default;
      virtual void operator()() = 0;
    };

    HttpSession& self_;
    std::vector<std::unique_ptr<Work>> items_;

   public:
    explicit Queue(HttpSession& self) : self_(self) {
      static_assert(limit > 0, "queue limit must be positive");
      items_.reserve(limit);
    }

    // Returns `true` if we have reached the queue limit
    bool IsFull() const {
      return items_.size() >= limit;
    }

    // Called when a message finishes sending
    // Returns `true` if the caller should initiate a read
    bool OnWrite() {
      BOOST_ASSERT(!items_.empty());
      auto const was_full = IsFull();
      items_.erase(items_.begin());
      if (!items_.empty())
        (*items_.front())();
      return was_full;
    }

    // Called by the HTTP handler to send a response.
    template <bool isRequest, class Body, class Fields>
    void operator()(http::message<isRequest, Body, Fields>&& msg) {
      // This holds a work item
      struct WorkImpl : Work {
        HttpSession& self_;
        http::message<isRequest, Body, Fields> msg_;

        WorkImpl(HttpSession& self, http::message<isRequest, Body, Fields>&& msg) : self_(self), msg_(std::move(msg)) {}

        void operator()() {
          http::async_write(self_.Derived().Stream(), msg_,
                            beast::bind_front_handler(&HttpSession::OnWrite, self_.Derived().shared_from_this(), msg_.need_eof()));
        }
      };

      // Allocate and store the work
      items_.push_back(boost::make_unique<WorkImpl>(self_, std::move(msg)));

      // If there was no previous work, start this one
      if (items_.size() == 1)
        (*items_.front())();
    }
  };

  std::shared_ptr<WebsocketSessionSet> websocket_sessions_;
  Queue queue_;

  // The parser is stored in an optional container so we can
  // construct it from scratch it at the beginning of each new message.
  boost::optional<http::request_parser<http::string_body>> parser_;

 protected:
  beast::flat_buffer buffer_;

 public:
  // Construct the session
  HttpSession(beast::flat_buffer buffer, std::shared_ptr<WebsocketSessionSet> websocket_sessions)
      : websocket_sessions_(websocket_sessions), queue_(*this), buffer_(std::move(buffer)) {}

  void DoRead() {
    // Construct a new parser for each message
    parser_.emplace();

    // Apply a reasonable limit to the allowed size
    // of the body in bytes to prevent abuse.
    parser_->body_limit(10000);

    // Set the timeout.
    beast::get_lowest_layer(Derived().Stream()).expires_after(std::chrono::seconds(30));

    // Read a request using the parser-oriented interface
    http::async_read(Derived().Stream(), buffer_, *parser_, beast::bind_front_handler(&HttpSession::OnRead, Derived().shared_from_this()));
  }

  void OnRead(beast::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);

    // This means they closed the connection
    if (ec == http::error::end_of_stream)
      return Derived().DoEof();

    if (ec)
      return HandleError(ec, "read");

    // See if it is a WebSocket Upgrade
    if (websocket::is_upgrade(parser_->get())) {
      // Disable the timeout.
      // The websocket::stream uses its own timeout settings.
      beast::get_lowest_layer(Derived().Stream()).expires_never();

      // Create a websocket session, transferring ownership
      // of both the socket and the HTTP request.
      return MakeWebsocketSession(Derived().ReleaseStream(), parser_->release(), websocket_sessions_);
    }

    // Send the response
    ManageApi::HandleRequest(parser_->release(), queue_);

    // If we aren't at the queue limit, try to pipeline another request
    if (!queue_.IsFull())
      DoRead();
  }

  void OnWrite(bool close, beast::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);
    if (ec)
      return HandleError(ec, "write");

    if (close) {
      // This means we should close the connection, usually because
      // the response indicated the "Connection: close" semantic.
      return Derived().DoEof();
    }

    // Inform the queue that a write completed
    if (queue_.OnWrite()) {
      // Read another request
      DoRead();
    }
  }
};
