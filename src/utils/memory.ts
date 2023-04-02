import {
  readdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { basename } from "path";
import { truncateText } from ".";

type Memo = {
  data: object | string;
  description: string;
  size: number;
  updateAt: string;
  createAt: string;
};
type MemoPreview = Omit<Memo, "data">;

export class MemoryJson {
  constructor(public id: string) {}

  Path = {
    getFilePath: (name) => `${this.Path.getFolder()}/${name}${this.Path.ext}`,
    getFolder: () => "./memory/" + this.id,
    ext: ".json",
  };

  read(name) {
    try {
      var data = readFileSync(this.Path.getFilePath(name), "utf-8");
      return JSON.parse(data) as Memo;
    } catch (error) {
      throw new Error(`Memory '${name}' does not exist`);
    }
  }

  createMemo(description: string): Memo {
    return {
      description: description.split(" ").slice(0, 10).join(" "),
      data: "",
      size: 0,
      createAt: new Date().toLocaleString(),
      updateAt: new Date().toLocaleString(),
    };
  }

  isExist(name) {
    return existsSync(this.Path.getFilePath(name));
  }

  update(name: string, data: Memo) {
    let old = this.read(name);
    old.data = data;
    old.updateAt = new Date().toLocaleString();
    old.size = JSON.stringify(data).length;
    writeFileSync(this.Path.getFilePath(name), JSON.stringify(old));
  }
  create(name: string, description: string) {
    let old = this.read(name);
    if (!old) old = this.createMemo(description);
    else {
      old.description = description.split(" ").slice(0, 10).join(" ");
      old.updateAt = new Date().toLocaleString();
    }
    writeFileSync(this.Path.getFilePath(name), JSON.stringify(old));
  }

  delete(name) {
    unlinkSync(this.Path.getFilePath(name));
  }

  list() {
    const notes = readdirSync(this.Path.getFolder());
    const obj: Record<string, MemoPreview> = {};
    notes.map((path) => {
      const nameFile = basename(path, this.Path.ext);
      const data = this.read(nameFile);
      delete (data as any).data;
      obj[nameFile] = data;
    });
    return obj;
  }

  preview() {
    return this.list();
  }

  load(name) {
    return this.read(name);
  }
}
