(function () {
  var script = document.currentScript;
  var base = (script && script.getAttribute("data-base")) || "./";
  if (base.slice(-1) !== "/") base += "/";
  var card = document.createElement("aside");
  card.setAttribute("data-cxone-embed", "");
  card.style.cssText = "font:14px/1.4 Georgia,serif;max-width:28rem;padding:12px;border:2px solid #7c3aed;border-radius:12px;background:#fff";
  card.innerHTML = '<strong>NICE CXone Lab</strong><p>Independent, free, learning-only study material. No affiliation. Trademarks belong to their owners.</p><p><a href="' + base + '">Open the lab</a> · <a href="https://cyphermonkeylabs.com">Website</a> · <a href="https://github.com/CypherMonkeyLabs">GitHub</a> · <a href="https://linktr.ee/cyphermonkey">Linktree</a></p>';
  script.parentNode.insertBefore(card, script.nextSibling);
})();
