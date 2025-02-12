#pragma once

#include <kj/common.h>

#include <cstdint>

namespace workerd::jsg {
class Lock;
class BufferSource;
}  // namespace workerd::jsg

namespace workerd::api {

// Generate a random prime number
jsg::BufferSource randomPrime(jsg::Lock& js,
    uint32_t size,
    bool safe,
    kj::Maybe<kj::ArrayPtr<kj::byte>> add_buf,
    kj::Maybe<kj::ArrayPtr<kj::byte>> rem_buf);

// Checks if the given buffer represents a prime.
bool checkPrime(kj::ArrayPtr<kj::byte> buffer, uint32_t num_checks);

}  // namespace workerd::api
