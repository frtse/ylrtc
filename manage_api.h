#pragma once

#include <string>

#include "utils.h"
#include "sdptransform/json.hpp"
#include "room_manager.h"

class ManageApi {
 public:
  template <class Body, class Allocator, class Send>
  static void HandleRequest(http::request<Body, http::basic_fields<Allocator>>&& req, Send&& send) {
    // Returns a bad request response
    auto const bad_request = [&req](beast::string_view why) {
      http::response<http::string_body> res{http::status::bad_request, req.version()};
      res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
      res.set(http::field::content_type, "text/html");
      res.keep_alive(req.keep_alive());
      res.body() = std::string(why);
      res.prepare_payload();
      return res;
    };

    // Returns a server error response
    auto const server_error = [&req](beast::string_view what) {
      http::response<http::string_body> res{http::status::internal_server_error, req.version()};
      res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
      res.set(http::field::content_type, "text/html");
      res.keep_alive(req.keep_alive());
      res.body() = "An error occurred: '" + std::string(what) + "'";
      res.prepare_payload();
      return res;
    };

    // Make sure we can handle the method
    if (req.method() != http::verb::get && req.method() != http::verb::post
      && req.method() != http::verb::delete_)
      return send(bad_request("Unknown HTTP-method"));

    // Request path must be absolute and not contain "..".
    if (req.target().empty() || req.target()[0] != '/'
      || req.target().find("..") != beast::string_view::npos)
      return send(bad_request("Illegal request-target"));

    std::string res_body;
    try {
      std::string target = req.target().data(); 
      if (target.find("/rooms") != std::string::npos) {
        if (req.method() == http::verb::post) {
          std::string req_body = req.body();
          auto req_json = nlohmann::json::parse(req_body);
          std::string room_id = req_json.at("id");
          auto room = RoomManager::GetInstance().CreateRoom(room_id);
          if (!room)
            return send(bad_request("Room ID already exists"));
          nlohmann::json response;
          response["id"] = room_id;
          res_body = response.dump();
        }
        else if (req.method() == http::verb::get) {
          auto room_id_array = RoomManager::GetInstance().GetAllRoomId();
          nlohmann::json response = nlohmann::json::array();
          for (auto& room_id : room_id_array)
            response.push_back(room_id);
          res_body = response.dump();
        }
        else if (req.method() == http::verb::delete_) {
          auto pos = target.rfind('/');
          if (pos == std::string::npos)
            return send(bad_request("Request parse error"));
          std::string room_id = res_body.substr(pos);
          RoomManager::GetInstance().DestroyRoom(room_id);
        }
        else {
          return send(bad_request("Unsupported HTTP-method"));
        }
      }
    } catch (...) {
      return send(bad_request("Request parse error"));
    }

    auto const res_body_size = res_body.size();
    http::response<http::string_body> res{std::piecewise_construct,
      std::make_tuple(std::move(res_body)), std::make_tuple(http::status::ok, req.version())};
    res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
    if (!res_body.empty()) {
      res.set(http::field::content_type, "application/json");
      res.content_length(res_body_size);
    }
    res.keep_alive(req.keep_alive());
    return send(std::move(res));
  }
};