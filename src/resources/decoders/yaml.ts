import yaml from "js-yaml";
import { Inter, InterRes } from "../../interactions";
import { BaseDecoder } from "./base";
import { Roles } from "../utils/Roles";

export class YamlDecoder extends BaseDecoder {
  name: string = "YAML";

  parse({ roles }: { roles: Roles }, message: string): Inter[] {
    var value: Inter | Inter[];
    message = message.trim();
    message = message.replace(new RegExp(`/^${roles.v.ai}:(?:\n|\\n)/g`), "");
    value = yaml.load(message) as Inter[];

    return Array.isArray(value) ? value : [value];
  }

  buildResultRaw(result: InterRes | InterRes[]): string {
    return yaml.dump(result, { replacer: this.replacer });
  }

  getStop({ roles }: { roles: Roles }) {
    return [`${roles.v.system}:\n`];
  }

  async tryInteractionRaw(
    message: string,
    { roles, noInput }: { roles: Roles; noInput: boolean }
  ): Promise<string> {
    try {
      var list = this.parse({ roles }, message);
    } catch (error: any) {
      return this.buildResultRaw({ error: error?.message });
    }
    const result = await this.tryRun(list, { roles, noInput });
    return this.buildResultRaw(result);
  }
  buildRaw(type: string, props: object): string {
    return this.buildResultRaw([{ type, ...props }]);
  }

  //@ts-ignore
  replacer(key, value) {
    if (typeof value === "function") {
      return undefined;
    }
    return value;
  }
}
