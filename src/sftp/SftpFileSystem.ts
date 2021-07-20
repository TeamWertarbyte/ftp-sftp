import { SFTPWrapper } from 'ssh2';
import SftpClient from 'ssh2-sftp-client';
import { FileType } from '../FileInfo';
import FileSystem from '../FileSystem';
import SftpFileInfo from './SftpFileInfo';

export default class SftpFileSystem implements FileSystem<SftpFileInfo> {
  constructor(public readonly client: SftpClient, private readonly sftp: SFTPWrapper) {}

  /**
   * Create a SftpFileSystem and open the connection.
   * @param options.connectionOptions Additional connection options for the ssh2-sftp-client client, see https://www.npmjs.com/package/ssh2-sftp-client#sec-5-2-2
   * @returns Connected SftpFileSystem
   */
  static async create({
    host,
    port,
    user,
    password,
    connectionOptions,
  }: {
    host: string;
    port: number;
    user: string;
    password?: string;
    connectionOptions?: SftpClient.ConnectOptions;
  }): Promise<SftpFileSystem> {
    const c = new SftpClient();
    const sftp = await c.connect({ host, port, username: user, password, ...connectionOptions });
    return new SftpFileSystem(c, sftp);
  }

  async list(path: string): Promise<SftpFileInfo[]> {
    const paths = await this.client.list(path);
    return paths.map((it: SftpClient.FileInfo) => new SftpFileInfo(it));
  }

  async put(src: string | Buffer | NodeJS.ReadableStream, toPath: string): Promise<void> {
    await this.client.put(src, toPath);
  }

  get(path: string): Promise<Buffer> {
    return this.client.get(path) as Promise<Buffer>;
  }

  async readToStream(path: string): Promise<NodeJS.ReadableStream> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.sftp.createReadStream(path));
      } catch (e) {
        reject(e);
      }
    });
  }

  async mkdir(path: string, recursive: boolean): Promise<void> {
    await this.client.mkdir(path, recursive);
  }

  async rmdir(path: string, recursive: boolean): Promise<void> {
    await this.client.rmdir(path, recursive);
  }

  async delete(path: string): Promise<void> {
    await this.client.delete(path);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
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

  async close(): Promise<void> {
    await this.client.end();
  }
}
