const TODAY = new Date().toISOString().slice(0, 10);

function waitForTimeline() {
  const el = document.querySelector(".js-timeline__list");
  if (el) init(el);
  else setTimeout(waitForTimeline, 500);
}

function init(timeline) {
  browser.storage.local.get(["xml", "lastImport"]).then(data => {
    if (data.lastImport !== TODAY) {
      showBanner();
    } else if (data.xml) {
      injectDevoirs(data.xml, timeline);
    }
  });
}

function showBanner() {
  if (document.getElementById("devoirs-perso-banner")) return;

  const banner = document.createElement("div");
  banner.id = "devoirs-perso-banner";
  banner.innerHTML = `
    📄 Importe ton fichier XML —
    <span style="text-decoration:underline;cursor:pointer">glisser ici ou cliquer</span>
    <input type="file" accept=".xml" hidden>
  `;
  banner.style.cssText = `
    position:sticky;top:0;z-index:9999;
    background:#fff3cd;padding:8px;
    font-size:14px;border-bottom:1px solid #ccc;
  `;

  const input = banner.querySelector("input");
  banner.onclick = () => input.click();
  input.onchange = e => loadFile(e.target.files[0]);

  banner.ondragover = e => e.preventDefault();
  banner.ondrop = e => {
    e.preventDefault();
    loadFile(e.dataTransfer.files[0]);
  };

  document.body.prepend(banner);
}

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    browser.storage.local.set({
      xml: reader.result,
      lastImport: TODAY
    }).then(() => location.reload());
  };
  reader.readAsText(file);
}

function injectDevoirs(xmlString, timeline) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "application/xml");
  const devoirs = xml.querySelectorAll("devoir");

  const li = document.createElement("li");
  li.innerHTML = `<h3>Mes devoirs perso</h3><ul></ul>`;
  const ul = li.querySelector("ul");

  devoirs.forEach(d => {
    const item = document.createElement("li");
    item.textContent =
      `${d.getAttribute("nom")} — ${d.getAttribute("matière")} — ${d.getAttribute("date")}`;
    ul.appendChild(item);
  });

  timeline.appendChild(li);
}

waitForTimeline();
