import SftpClient = require('ssh2-sftp-client');
import FileInfo, { FileType } from '../FileInfo';

export default class SftpFileInfo implements FileInfo {
  constructor(public readonly original: SftpClient.FileInfo) {}

  get name(): string {
    return this.original.name;
  }

  get size(): number {
    return this.original.size;
  }

  get type() {
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

  get isDirectory() {
    return this.original.type === 'd';
  }
}
