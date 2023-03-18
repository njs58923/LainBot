const findContext = () => {
  return findProps(querySelector("div[class*=react-scroll-to-bottom] div[class*=react-scroll-to-bottom]")).children.props;
};

// no agarra el ultimo mensaje
const findComments = () => {
  let list = [...document.querySelectorAll("div.group")].map(
    (i) =>
      findFiber(i)
        .pendingProps.children.filter((i) => !!i)
        .find((i) => "props" in i)
        .props.children.find((i) => i.type === "div").props.children[0].props.children[0].props.message.message
  );
  return list;
};

// no agarra el ultimo mensaje
const findCommentsB = () => {
  return findContext().conversationTurns;
};

const findCommentsC = () => {
  return findFiber(document.querySelector("div.items-center.dark\\:bg-gray-800"))
    .memoizedProps.children.filter((i) => i && Array.isArray(i) && i.some((i) => i && "props" in i))[0]
    ?.filter((i) => !!i)
    .map((i) => i.props.turn);
};

const findMessages = () => {
  return findComments().map((m) => ({
    role: m.author.role,
    content: m.content.parts.join(" "),
  }));
};

const findModelInfo = () => {
  const ctx = findContext();
  return JSON.stringify(ctx.availableModels.find((i) => i.id === ctx.currentThreadModel));
};

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

const sendInput = async (content) => {
  querySelector("textarea")?.focus();
  await new Promise((r) => setTimeout(r, 500 + Math.random()));
  page_keyboard(content + "\n");
  await waitForSelector("form button.absolute div.text-2xl");
  await waitNotForSelector("form button.absolute div.text-2xl");

  let messages = findMessages();

  return messages[messages.length - 1].content;
};

const waitLoading = async () => {
  await waitForSelector("H1.ml-auto");
  await waitForSelector("textarea");
  return true;
};

window.chatGPT = {
  waitLoading,
  findContext,
  findMessages,
  findComments,
  findCommentsB,
  findCommentsC,
  findModelInfo,
  waitInput,
  sendInput,
};
