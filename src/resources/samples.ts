import { RolesType } from "./context";

export const Samples = {
  simple: (roles: RolesType) => [
    { role: roles.ai, content: `{"type":"ia.init"}` },
    { role: roles.system, content: `{result: "OK"}` },
    { role: roles.ai, content: `{"type":"command.powershell", "commad": "Get-Date"}` },
    { role: roles.system, content: `{"result":"17:56:45"}` },
    { role: roles.ai, content: `{"type":"ia.wait"}` },
  ],
};
