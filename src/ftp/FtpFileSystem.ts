import FtpClient from 'ftp';
import { FileType } from '../FileInfo';
import FileSystem from '../FileSystem';
import FtpFileInfo from './FtpFileInfo';

export default class FtpFileSystem implements FileSystem<FtpFileInfo> {
  constructor(public readonly client: FtpClient) {}

  /**
   * Create a FtpFileSystem and open the connection.
   * @param options.connectionOptions Additional connection options for the ftp client, see https://www.npmjs.com/package/ftp#methods
   * @returns Connected FtpFileSystem
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
    password: string;
    connectionOptions?: FtpClient.Options;
  }): Promise<FtpFileSystem | Error> {
    const c = new FtpClient();
    return new Promise((resolve, reject) => {
      c.on('ready', () => {
        resolve(new FtpFileSystem(c));
      });
      c.once('error', (err: Error) => {
        reject(err);
      });
      c.connect({
        host,
        port,
        user,
        password,
        ...connectionOptions,
      });
    });
  }

  list(path: string): Promise<FtpFileInfo[]> {
    return new Promise((resolve, reject) => {
      this.client.list(path, (err: Error, listing: FtpClient.ListingElement[]) => {
        if (err) {
          return reject(err);
        }
        resolve(listing.map((l) => new FtpFileInfo(l)));
      });
    });
  }

  put(src: string | Buffer | NodeJS.ReadableStream, toPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.put(src, toPath, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  get(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.client.get(path, (err: Error, stream: NodeJS.ReadableStream) => {
        if (err) {
          return reject(err);
        }
        const buffers: Buffer[] = [];
        stream.on('data', (d) => buffers.push(d));
        stream.on('end', () => resolve(Buffer.concat(buffers)));
        stream.once('error', (err) => reject(err));
      });
    });
  }

  getStream(path: string): Promise<NodeJS.ReadableStream> {
    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      this.client.get(path, (err: Error, stream: NodeJS.ReadableStream) => {
        if (err) {
          return reject(err);
        }
        resolve(stream);
      });
    });
  }

  mkdir(path: string, recursive: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.mkdir(path, recursive, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  rmdir(path: string, recursive: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.rmdir(path, recursive, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  delete(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.delete(path, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  rename(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.rename(oldPath, newPath, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async exists(path: string): Promise<false | FileType> {
    try {
      const result = await this.list(path);
      return result[0].type;
    } catch (err) {
      if (err.code === 550) {
        // not found or action not taken
        return false;
      } else {
        throw err;
      }
    }
  }

  close(force = false): Promise<void> {
    if (force) {
      // close the connection immediately
      this.client.destroy();
    } else {
      // close the connection after all enqueued commands have been executed
      this.client.end();
    }
    return Promise.resolve();
  }
}
