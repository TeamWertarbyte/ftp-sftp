import { Stats } from 'fs';
import FileInfo, { FileType } from '../FileInfo';

export default class LocalFileInfo implements FileInfo {
  constructor(public readonly name: string, public readonly original: Stats) {}

  get size(): number {
    return this.original.size;
  }

  get type(): FileType {
    return LocalFileInfo.getType(this.original);
  }

  get isDirectory(): boolean {
    return this.original.isDirectory();
  }

  static getType(info: Stats): FileType {
    if (info.isSymbolicLink()) {
      return FileType.Link;
    } else if (info.isDirectory()) {
      return FileType.Directory;
    } else {
      return FileType.File;
    }
  }
}
