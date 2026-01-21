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

  if (!devoirs.length) return;

  // bloc principal (copie structure ENT)
  const li = document.createElement("li");
  li.className = "timeline__list-item";

  li.innerHTML = `
    <section class="panel panel--timeline">
      <header class="panel__header">
        <h3 class="panel__title">Mes devoirs perso</h3>
      </header>
      <div class="panel__content">
        <ul class="taf__list"></ul>
      </div>
    </section>
  `;

  const ul = li.querySelector(".taf__list");

  devoirs.forEach(d => {
    const item = document.createElement("li");
    item.className = "taf__item";
    item.innerHTML = `
      <div class="taf__subject">${d.getAttribute("matière")}</div>
      <div class="taf__content">
        <strong>${d.getAttribute("nom")}</strong>
        <div class="taf__date">Pour ${d.getAttribute("date")}</div>
      </div>
    `;
    ul.appendChild(item);
  });

  // insertion ENTRE "Pour demain" et "Pour plus tard"
  const items = [...timeline.children];
  const tomorrow = items.find(el =>
    el.textContent.includes("Pour demain")
  );

  if (tomorrow && tomorrow.nextSibling) {
    timeline.insertBefore(li, tomorrow.nextSibling);
  } else {
    timeline.appendChild(li);
  }
}


waitForTimeline();
