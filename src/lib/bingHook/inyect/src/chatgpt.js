const waitInput = async () => {
  while (true) {
    let conteiner = document.querySelector(".dark\\\\:bg-gray-700");
    let input = conteiner?.querySelector("textarea");
    let btn = conteiner?.querySelector("button");
    if (!conteiner || !input || !btn) {
      await new Promise((r) => setTimeout(r, 1000 + Math.random()));
      continue;
    }
    break;
  }
};

const setInput = async (content) => {
  let conteiner = document.querySelector(".dark\\\\:bg-gray-700");
  let input = conteiner?.querySelector("textarea");
  if (input) {
    input.outerText = content;
    return true;
  }
  return false;
};

window.chatGPT = {
  waitInput,
  setInput,
};
