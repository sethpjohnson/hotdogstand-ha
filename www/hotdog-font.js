// Hot Dog Stand theme — registers the "Pixelated MS Sans Serif" webfont
// (MIT-licensed, from the 98.css project) document-wide so Home Assistant's
// shadow-DOM text can use it. Loaded via frontend.extra_module_url.
(function () {
  if (document.getElementById("hotdog-font-face")) return;
  var s = document.createElement("style");
  s.id = "hotdog-font-face";
  s.textContent =
    "@font-face{font-family:'Pixelated MS Sans Serif';" +
    "src:url('/local/fonts/ms_sans_serif.woff2') format('woff2');" +
    "font-weight:400;font-display:swap;}" +
    "@font-face{font-family:'Pixelated MS Sans Serif';" +
    "src:url('/local/fonts/ms_sans_serif_bold.woff2') format('woff2');" +
    "font-weight:700;font-display:swap;}";
  document.head.appendChild(s);
})();
