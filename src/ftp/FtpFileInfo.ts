import FileInfo, { FileType } from '../FileInfo';
import FtpClient = require('ftp');

export default class FtpFileInfo implements FileInfo {
  constructor(public readonly original: FtpClient.ListingElement) {}

  get name(): string {
    return this.original.name;
  }

  get size(): number {
    return this.original.size;
  }

  get type(): FileType {
    switch (this.original.type) {
      case 'd':
        return FileType.Directory;
      case 'l':
        return FileType.Link;
      case '-':
      default:
        return FileType.File;
    }
  }

  get isDirectory(): boolean {
    return this.original.type === 'd';
  }
}
