#pragma once

#include <workerd/io/compatibility-date.capnp.h>
#include <workerd/jsg/jsg.h>

namespace workerd::api::pyodide {
struct EmscriptenRuntime {
  jsg::JsRef<jsg::JsValue> contextToken;
  jsg::JsRef<jsg::JsValue> emscriptenRuntime;
  static EmscriptenRuntime initialize(jsg::Lock& js,
      bool isWorkerd,
      const CompatibilityFlags::Reader& featureFlags,
      jsg::Bundle::Reader bundle);
};
}  // namespace workerd::api::pyodide
