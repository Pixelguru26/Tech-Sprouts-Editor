const TabManager = class TabManager {
  constructor(...tabs) {
    this.tabs = tabs;
    this.currentTab = null;
  }

  setTab(tgtid) {
    let ret = false;
    if (this.currentTab === tgtid) return true;
    if (this.tabs.includes(tgtid)) {
      this.tabs.forEach((id) => {
        // Works well enough for now.
        // Todo: narrow scope to object
        let tabHead = document.getElementById("tabhead-" + id);
        let tabBody = document.getElementById("tab-" + id);
        if (tabHead && tabBody) {
          if (tgtid === id) {
            tabHead.classList.add("active");
            tabBody.classList.remove("hidden");
            ret = true;
          }
          else {
            tabHead.classList.remove("active");
            tabBody.classList.add("hidden");
          }
        }
      });
      this.currentTab = tgtid;
    }
    return ret;
  }

  hashChange(hash) {
    let hashTab = "docs"; // Magic string but it's just a default
    for (let entry of hash.split('&')) {
      if (entry.startsWith("tab=")) {
        hashTab = entry.substring("tab=".length);
        break;
      }
    }
    return this.setTab(hashTab);
  }
}
export default TabManager;