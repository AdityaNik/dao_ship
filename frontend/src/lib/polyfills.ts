// Polyfills for browser environment
if (typeof global === "undefined") {
  (window as any).global = window;
}

if (typeof process === "undefined") {
  (window as any).process = {
    env: {},
    browser: true,
  };
}

// Buffer polyfill
if (typeof Buffer === "undefined") {
  import("buffer").then(({ Buffer }) => {
    (window as any).Buffer = Buffer;
  });
}
