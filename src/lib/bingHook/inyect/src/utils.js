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

export const querySelector = window.querySelector;
export const waitForSelector = window.waitForSelector;
export const waitNotForSelector = window.waitNotForSelector;
