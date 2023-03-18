window.querySelector = (list = "", value = document) => {
  list
    .split(" ")
    .map((e) => e.split(":"))
    .map(([select, attr]) => {
      if (!value) return;
      value = value.querySelector(select);
      if (value && attr === "shadow") value = value.shadowRoot;
    });
  return value;
};

window.waitForSelector = async (select, { timeout } = {}) => {
  while (true) {
    if (querySelector(select)) break;
    await new Promise((r) => setTimeout(r, 100));
  }
};
window.waitNotForSelector = async (select, { timeout } = {}) => {
  while (true) {
    if (!querySelector(select)) break;
    await new Promise((r) => setTimeout(r, 100));
  }
};

window.findFiber = (div) => {
  const key = Object.keys(div).find((i) => i.indexOf("__reactFiber") === 0);
  return div[key];
};
window.findProps = (div) => {
  const key = Object.keys(div).find((i) => i.indexOf("__reactProps") === 0);
  return div[key];
};

export const querySelector = window.querySelector;
export const waitForSelector = window.waitForSelector;
export const waitNotForSelector = window.waitNotForSelector;
