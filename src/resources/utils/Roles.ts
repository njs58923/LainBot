import { Decoder } from "../../interactions";

export type RolesType = {
  ai: string;
  system: string;
  context: string;
};

export class Roles {
  constructor(public v: RolesType) {}
  replace(text: string) {
    return text.replace(/{{D}}|{{S}}|{{C}}|{{F}}/g, (match) => {
      if (match === "{{F}}") return Decoder.name;
      if (match === "{{D}}") return this.v.ai;
      if (match === "{{S}}") return this.v.system;
      if (match === "{{C}}") return this.v.context;
      throw 0;
    });
  }
  replaceAll(...text: string[]) {
    return text.map((t) => this.replace(t));
  }
}
