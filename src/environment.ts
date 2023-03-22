require("dotenv").config();

export const Environment = {
  isDebug: process.env.DEBUG?.toLocaleLowerCase() === `true`,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
