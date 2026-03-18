function Tabsy(selector, options) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Tabsy: No container found for selector '${selector}'`);
    return;
  }

  this.tabLinks = Array.from(this.container.querySelectorAll("li a"));
  if (!this.tabLinks.length) {
    console.error("Tabsy: No tabs found inside the container");
    return;
  }

  this.panels = this._getPanel();
  if (this.tabLinks.length !== this.panels.length) return;

  this._cleanRegex = /[^a-zA-Z0-9]/g;
  this.paramKey = selector.replace(this._cleanRegex, "");

  this.opt = Object.assign(
    {
      activeClassName: "tabsy--active",
      rememberTab: false,
      onChange: null,
    },
    options,
  );

  this._originHTML = this.container.innerHTML;
  this._init();
}

Tabsy.prototype._getPanel = function () {
  return this.tabLinks
    .map((tabLink) => {
      const panel = document.querySelector(tabLink.getAttribute("href"));
      if (!panel) {
        console.error(
          `Tabsy: No panel found for selector '${tabLink.getAttribute("href")}'`,
        );
      }
      return panel;
    })
    .filter(Boolean);
};

// replace(/[^a-zA-Z0-9]/g, '')

Tabsy.prototype._init = function () {
  const params = new URLSearchParams(location.search);
  const tabSelector = params.get(this.paramKey);
  const tab =
    (this.opt.rememberTab &&
      tabSelector &&
      this.tabLinks.find(
        (tabLink) =>
          tabLink.getAttribute("href").replace(this._cleanRegex, "") ===
          tabSelector,
      )) ||
    this.tabLinks[0];

  this.currentTab = tab;

  this._activateTab(tab, false, false);

  this.tabLinks.forEach((tabLink) => {
    tabLink.onclick = (event) => {
      event.preventDefault();
      this._tryActivateTab(tabLink);
    };
  });
};

Tabsy.prototype._activateTab = function (
  tabLink,
  triggerOnChange = true,
  updateURL = this.opt.rememberTab,
) {
  this.tabLinks.forEach((tabLink) => {
    tabLink.closest("li").classList.remove(this.opt.activeClassName);
  });

  tabLink.closest("li").classList.add(this.opt.activeClassName);

  this.panels.forEach((panel) => {
    panel.hidden = true;
  });

  const panelActive = document.querySelector(tabLink.getAttribute("href"));
  panelActive.hidden = false;

  if (updateURL) {
    const params = new URLSearchParams(location.search);
    params.set(
      this.paramKey,
      tabLink.getAttribute("href").replace(this._cleanRegex, ""),
    );
    history.replaceState(null, null, `?${params}`);
  }

  if (triggerOnChange && typeof this.opt.onChange === "function") {
    this.opt.onChange({
      tab: tabLink,
      panel: panelActive,
    });
  }
};

Tabsy.prototype.switch = function (input) {
  let tabToActivate = null;

  if (typeof input === "string") {
    tabToActivate = this.tabLinks.find(
      (tabLink) => tabLink.getAttribute("href") === input,
    );
    if (!tabToActivate) {
      console.error(`Tabsy: No tab found for selector '${input}'`);
      return;
    }
  } else if (this.tabLinks.includes(input)) {
    tabToActivate = input;
  }

  if (!tabToActivate) {
    console.error(`Tabsy: Invalid input '${input}'`);
    return;
  }
  this._tryActivateTab(tabToActivate);
};

Tabsy.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this._activateTab(tab);
    this.currentTab = tab;
  }
};

Tabsy.prototype.destroy = function () {
  this.container.innerHTML = this._originHTML;
  this.panels.forEach((panel) => {
    panel.hidden = false;
  });
  this.container = null;
  this.tabLinks = null;
  this.panels = null;
  this.currentTab = null;
};

window.Tabsy = Tabsy;
