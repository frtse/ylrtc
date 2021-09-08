#include "random.h"

std::string Random::characters_{"0123456789abcdefghijklmnopqrstuvwxyz"};

Random::Random() : engine_{device_()} {}

std::string Random::RandomString(size_t length) {
  std::string random_string;
  random_string.reserve(length);

  for (std::size_t i = 0; i < length; ++i) {
    random_string += characters_[RandomNumber(0ul, characters_.size() - 1)];
  }

  return random_string;
}