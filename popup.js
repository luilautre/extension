document.getElementById("reload").onclick = () => {
  browser.storage.local.remove(["xml", "lastImport"]);
};
