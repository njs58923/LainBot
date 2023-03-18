import { flatten } from "lodash";
import { waitForSelector } from "./utils";

const findComments = () => {
  const list = querySelector(
    ".cib-serp-main:shadow #cib-conversation-main:shadow"
  )?.querySelectorAll("cib-chat-turn");
  return [...list].map((turn) =>
    [...turn?.shadowRoot?.querySelectorAll("cib-message-group")].map(
      (groud) => ({
        source: groud.getAttribute("source"),
        text: [...groud.shadowRoot?.querySelectorAll("cib-message")].map(
          (cib) =>
            cib.shadowRoot?.querySelector(".text-message-content")
              ?.textContent ||
            querySelector(
              "cib-shared:shadow .text-message-content:shadow",
              cib.shadowRoot
            )?.textContent ||
            querySelector("cib-shared:shadow p", cib.shadowRoot)?.textContent ||
            querySelector("cib-shared p", cib.shadowRoot)?.textContent
        ),
      })
    )
  );
};

const findMessages = () => {
  return flatten(findComments()).map((i) => ({
    role: i.source ?? "",
    content: i.text.find((i) => !!i) ?? "",
  }));
};

const sendInput = async (content) => {
  querySelector(
    ".cib-serp-main:shadow #cib-action-bar-main:shadow #searchboxform"
  ).focus();
  await new Promise((r) => setTimeout(r, 500 + Math.random()));
  page_keyboard(content, true);

  while (true) {
    if (
      !querySelector(
        ".cib-serp-main:shadow #cib-action-bar-main:shadow cib-typing-indicator:shadow #stop-responding-button"
      ).disabled
    )
      break;
    await new Promise((r) => setTimeout(r, 100));
  }

  while (true) {
    if (
      querySelector(
        ".cib-serp-main:shadow #cib-action-bar-main:shadow cib-typing-indicator:shadow #stop-responding-button"
      ).disabled
    )
      break;
    await new Promise((r) => setTimeout(r, 100));
  }

  let messages = findMessages();

  return messages[messages.length - 1].content;
};

const stopInput = () => {
  querySelector(
    ".cib-serp-main:shadow #cib-action-bar-main:shadow cib-typing-indicator:shadow #stop-responding-button"
  ).focus();
  page_keyboard("\n");
};

const waitLoading = async () => {
  await waitForSelector(
    ".cib-serp-main:shadow #cib-conversation-main:shadow cib-tone-selector:shadow #tone-options"
  );
  return true;
};

window.chatBing = {
  waitLoading,
  findMessages,
  stopInput,
  sendInput,
};
