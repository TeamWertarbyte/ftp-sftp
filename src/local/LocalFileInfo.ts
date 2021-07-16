import { Stats } from 'fs';
import FileInfo, { FileType } from '../FileInfo';

export default class LocalFileInfo implements FileInfo {
  constructor(public readonly name: string, public readonly original: Stats) {}

  get size() {
    return this.original.size;
  }

  get type() {
    return LocalFileInfo.getType(this.original);
  }

  get isDirectory() {
    return this.original.isDirectory();
  }

  static getType(info: Stats) {
    if (info.isSymbolicLink()) {
      return FileType.Link;
    } else if (info.isDirectory()) {
      return FileType.Directory;
    } else {
      return FileType.File;
    }
  }
}
