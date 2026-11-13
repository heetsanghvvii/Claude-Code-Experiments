/* Camera barcode scanning. Uses the native BarcodeDetector when present, otherwise loads a pinned
 * ZXing build from cdn.jsdelivr.net only when the user presses the scan button.
 * The camera stream is always stopped when scanning ends. Nothing is uploaded. */
(function (root) {
  "use strict";
  var FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];
  var ZXING_URL = "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js";
  var active = null;

  function isSecure() { return typeof window === "undefined" || window.isSecureContext !== false; }

  function loadZxing() {
    if (root.ZXing) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = ZXING_URL;
      s.onload = res;
      s.onerror = function () { rej(new Error("Could not load the scanning library from the CDN (offline?). You can still type the digits.")); };
      document.head.appendChild(s);
    });
  }

  function friendly(e) {
    var n = e && e.name;
    if (n === "NotAllowedError" || n === "SecurityError") return "Camera permission was denied. Allow camera access in your browser settings, or type the digits instead.";
    if (n === "NotFoundError" || n === "OverconstrainedError" || n === "DevicesNotFoundError") return "No camera was found on this device. Type the digits instead.";
    if (n === "NotReadableError") return "The camera is in use by another app. Close it and try again, or type the digits.";
    return (e && e.message) ? e.message : "Could not start the camera.";
  }

  // start({ video, onCode(code), onStatus(text), onError(text) }) -> { stop() }
  function start(o) {
    stop();
    if (!isSecure()) { o.onError("Camera access needs a secure page (https or localhost). Type the digits instead."); return null; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { o.onError("This browser does not offer camera access. Type the digits instead."); return null; }
    var stopped = false, stream = null, timer = null, zx = null;
    var handle = { stop: function () {
      if (stopped) return; stopped = true;
      if (timer) clearTimeout(timer);
      try { if (zx) zx.reset(); } catch (e) {}
      if (stream) stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      var v = o.video; if (v) { try { v.pause(); } catch (e) {} v.srcObject = null; }
      if (active === handle) active = null;
    } };
    active = handle;
    o.onStatus("Starting camera...");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false }).then(function (s) {
      if (stopped) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s;
      o.video.srcObject = s; o.video.setAttribute("playsinline", ""); o.video.muted = true;
      return o.video.play().then(function () { begin(); });
    }).catch(function (e) { if (!stopped) { handle.stop(); o.onError(friendly(e)); } });

    function done(code) { if (stopped) return; handle.stop(); o.onCode(code); }

    function begin() {
      if (stopped) return;
      if ("BarcodeDetector" in root) {
        var det;
        try { det = new root.BarcodeDetector({ formats: FORMATS }); } catch (e) { det = null; }
        if (det) {
          o.onStatus("Point the camera at the barcode.");
          (function tick() {
            if (stopped) return;
            det.detect(o.video).then(function (r) {
              if (r && r.length && r[0].rawValue) done(r[0].rawValue); else timer = setTimeout(tick, 200);
            }, function () { timer = setTimeout(tick, 400); });
          })();
          return;
        }
      }
      o.onStatus("Loading scanner library...");
      loadZxing().then(function () {
        if (stopped) return;
        var Z = root.ZXing, hints = new Map();
        hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]);
        zx = new Z.BrowserMultiFormatReader(hints, 300);
        o.onStatus("Point the camera at the barcode.");
        zx.decodeFromVideoElement(o.video, function (result) { if (result) done(result.getText()); });
      }).catch(function (e) { if (!stopped) { handle.stop(); o.onError(e.message); } });
    }
    return handle;
  }

  function stop() { if (active) active.stop(); }

  var api = { start: start, stop: stop, FORMATS: FORMATS, ZXING_URL: ZXING_URL, friendly: friendly };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.scan = api; }
})(typeof window !== "undefined" ? window : globalThis);
