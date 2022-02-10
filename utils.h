#pragma once

#include <boost/asio.hpp>
#include <boost/asio/bind_executor.hpp>
#include <boost/asio/dispatch.hpp>
#include <boost/asio/signal_set.hpp>
#include <boost/asio/steady_timer.hpp>
#include <boost/asio/strand.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/version.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/make_unique.hpp>
#include <boost/optional.hpp>
#include <boost/stacktrace.hpp>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <functional>
#include <iostream>
#include <limits>
#include <memory>
#include <numeric>
#include <string>
#include <vector>

namespace beast = boost::beast;
namespace http = beast::http;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ssl = boost::asio::ssl;
using tcp = boost::asio::ip::tcp;
using udp = boost::asio::ip::udp;

/**
 * @brief Returns the current time in milliseconds
 * 
 */
int64_t TimeMillis();

/**
 * @brief Converts data into a string of characters represented by hexadecimal words.
 * 
 */
void DumpHex(const uint8_t* data, size_t size);

class NtpTime {
 public:
  static NtpTime CreateFromMillis(uint64_t millis);
  static NtpTime CreateFromCompactNtp(uint32_t compact_ntp);

  NtpTime(uint32_t seconds, uint32_t fractions);

  int64_t ToMillis() const;
  uint32_t Seconds() const;
  uint32_t Fractions() const;
  uint32_t ToCompactNtp();

 private:
  static constexpr uint64_t kFractionsPerSecond = 1ULL << 32;
  uint32_t seconds_;
  uint32_t fractions_;
};

std::vector<std::string> StringSplit(const std::string& s, const char* delim);
std::string StringToLower(const std::string& str);

#define CHECK(expression)                                                        \
  do {                                                                           \
    if (!(expression)) {                                                         \
      std::cerr << "Assertion failed: " << __FILE__ << ":" << __LINE__ << "\n\t" \
                << "Expression: " << #expression << "\n\t"                       \
                << "Stack trace:\n"                                              \
                << boost::stacktrace::stacktrace() << std::endl;                 \
      abort();                                                                   \
    }                                                                            \
  } while (false)

#ifdef NDEBUG
#define DCHECK(expression)
#else
#define DCHECK(expression) CHECK(expression)
#endif

#define NOTREACHED() CHECK(false)