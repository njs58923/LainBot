import yaml from "js-yaml";
import { Inter, InterRes } from "../../interactios";
import { Message, Roles } from "../context";
import { BaseDecoder } from "./base";

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

  async tryInteractionRaw(
    message: string,
    { roles }: { roles: Roles }
  ): Promise<string> {
    try {
      var list = this.parse({ roles }, message);
    } catch (error: any) {
      return this.buildResultRaw({ error: error?.message });
    }
    const result = await this.tryRun(list, { roles });
    return this.buildResultRaw(result);
  }
  buildRaw(type: string, props: object): string {
    return this.buildResultRaw([{ type, ...props }]);
  }

  replacer(key, value) {
    if (typeof value === "function") {
      return undefined;
    }
    return value;
  }
}
