import SftpClient from 'ssh2-sftp-client';
import { FileType } from '../FileInfo';
import FileSystem from '../FileSystem';
import SftpFileInfo from './SftpFileInfo';

export default class SftpFileSystem implements FileSystem<SftpFileInfo> {
  constructor(public readonly client: SftpClient) {}

  static async create(
    host: string,
    port: number,
    user: string,
    password?: string,
    options?: SftpClient.ConnectOptions,
  ) {
    const c = new SftpClient();
    await c.connect({ host, port, username: user, password, ...options });
    return new SftpFileSystem(c);
  }

  async list(path: string) {
    const paths = await this.client.list(path);
    return paths.map((it: SftpClient.FileInfo) => new SftpFileInfo(it));
  }

  async put(src: string | Buffer | NodeJS.ReadableStream, toPath: string) {
    await this.client.put(src, toPath);
  }

  get(path: string): Promise<Buffer> {
    return this.client.get(path) as Promise<Buffer>;
  }

  async readToStream(path: string, destination: NodeJS.WritableStream) {
    await this.client.get(path, destination);
  }

  async mkdir(path: string, recursive: boolean) {
    await this.client.mkdir(path, recursive);
  }

  async rmdir(path: string, recursive: boolean) {
    await this.client.rmdir(path, recursive);
  }

  async delete(path: string): Promise<void> {
    await this.client.delete(path);
  }

  async rename(oldPath: string, newPath: string) {
    await this.client.rename(oldPath, newPath);
  }

  /**
   * Tests to see if remote file or directory exists.
   * Returns type of remote object if it exists or false if it does not.
   * @param path path to the file or directory to test
   * @returns {FileType | false} false or file type
   */
  async exists(path: string): Promise<false | FileType> {
    const exists = await this.client.exists(path);
    if (exists === '-') {
      return FileType.File;
    } else if (exists === 'd') {
      return FileType.Directory;
    } else if (exists === 'l') {
      return FileType.Link;
    } else {
      return false;
    }
  }

  async close() {
    await this.client.end();
  }
}
