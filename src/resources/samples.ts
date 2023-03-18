import { Roles, RolesType } from "./context";

export const Samples = {
  simple: (roles: Roles) => [
    { role: roles.v.ai, content: `{"type":"ia.init"}` },
    { role: roles.v.system, content: `{result: "OK"}` },
    { role: roles.v.ai, content: `{"type":"command.powershell", "commad": "Get-Date"}` },
    { role: roles.v.system, content: `{"result":"17:56:45"}` },
    { role: roles.v.ai, content: `{"type":"ia.wait"}` },
  ],
};
