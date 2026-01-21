const TODAY = new Date().toISOString().slice(0, 10);

function waitForTimeline() {
  const timeline = document.querySelector(".js-timeline__list");
  if (timeline) init(timeline);
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

/* =========================
   BANNIÈRE IMPORT XML
   ========================= */
function showBanner() {
  if (document.getElementById("devoirs-perso-banner")) return;

  const banner = document.createElement("div");
  banner.id = "devoirs-perso-banner";
  banner.innerHTML = `
    📄 Importer mes devoirs perso —
    <span style="text-decoration:underline;cursor:pointer">
      glisser le XML ici ou cliquer
    </span>
    <input type="file" accept=".xml" hidden>
  `;

  banner.style.cssText = `
    position:sticky;
    top:0;
    z-index:9999;
    background:#fff;
    padding:8px 12px;
    font-size:14px;
    border-bottom:1px solid #ddd;
  `;

  const input = banner.querySelector("input");

  banner.onclick = () => input.click();

  banner.ondragover = e => e.preventDefault();
  banner.ondrop = e => {
    e.preventDefault();
    loadFile(e.dataTransfer.files[0]);
  };

  input.onchange = e => loadFile(e.target.files[0]);

  document.body.prepend(banner);
}

function loadFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    browser.storage.local.set({
      xml: reader.result,
      lastImport: TODAY
    }).then(() => location.reload());
  };
  reader.readAsText(file);
}

/* =========================
   INJECTION DES DEVOIRS
   ========================= */
function injectDevoirs(xmlString, timeline) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "application/xml");
  const devoirs = xml.querySelectorAll("devoir");

  if (!devoirs.length) return;

  const li = document.createElement("li");
  li.className = "timeline__list-item";

  li.innerHTML = `
    <div class="timeline__item">
      <h2 class="timeline__label">Mes devoirs perso</h2>
      <div class="panel panel--timeline">
        <div class="panel__content">
          <ul class="taf__list"></ul>
        </div>
      </div>
    </div>
  `;

  const ul = li.querySelector(".taf__list");

  devoirs.forEach(d => {
    const item = document.createElement("li");
    item.className = "taf__item";
    item.innerHTML = `
      <div class="taf__subject">${d.getAttribute("matière") || ""}</div>
      <div class="taf__content">
        <p class="taf__text">
          <strong>${d.getAttribute("nom") || ""}</strong>
        </p>
        <p class="taf__date">Pour ${d.getAttribute("date") || ""}</p>
      </div>
    `;
    ul.appendChild(item);
  });

  /* insertion ENTRE "Pour demain" et "Pour plus tard" */
  const items = [...timeline.querySelectorAll(".timeline__list-item")];

  const indexDemain = items.findIndex(item =>
    item.querySelector(".timeline__label")?.textContent.includes("Pour demain")
  );

  if (indexDemain !== -1 && items[indexDemain + 1]) {
    timeline.insertBefore(li, items[indexDemain + 1]);
  } else {
    timeline.appendChild(li);
  }
}

waitForTimeline();
