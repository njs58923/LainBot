import { Roles, RolesType } from "./context";

export const Samples = {
  simple: (roles: Roles) => [
    { role: roles.v.ai, content: `{"type":"ia.test"}` },
    { role: roles.v.system, content: `{result: "OK"}` },
    {
      role: roles.v.ai,
      content: `{"type":"command.execute", "commad": "Get-Date", "shell":"PowerShell"}`,
    },
    { role: roles.v.system, content: `{"result":"17:56:45"}` },
    { role: roles.v.ai, content: `{"type":"ia.wait"}` },
  ],
};

export const demos = [`¿Cuanto es 2 + 3?`, ``];

/*

  ¿Cuanto es 2 + 3?
  Believe me in "C:\Projects\" (create folder) a new project of a simple web in react that shows a gallery of kittens
  arregla el problema que tengo en "C:\MyAPP\", el loop no llega hasta el 100 por algún motivo
  solve the problem that I have in "C:\MyAPP\", the loop does not reach 100 for some reason, it is broken

*/
