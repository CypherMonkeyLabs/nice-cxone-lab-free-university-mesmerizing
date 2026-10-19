(function () {
  var here = location.href.split("#")[0].split("?")[0];
  if (here.endsWith("/index.html")) here = here.slice(0, -"index.html".length);
  else if (!here.endsWith("/")) here += "/";
  var next = new URL("campus/", here);
  if (location.hash) next.hash = location.hash;
  location.replace(next.href);
})();
