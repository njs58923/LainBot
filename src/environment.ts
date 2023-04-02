require("dotenv").config();

export const Env = {
  isDebug: process.env.DEBUG?.toLocaleLowerCase() === `true`,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  BING_WEB_HOOK: process.env.BING_WEB_HOOK,
  BROWSER_HOOK_URL: process.env.BROWSER_HOOK_URL,
};
