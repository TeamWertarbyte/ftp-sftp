import { readdir, stat, mkdir, rename, rm, readFile } from 'fs/promises';
import { createWriteStream, createReadStream } from 'fs';
import { join } from 'path';
import FileSystem from '../FileSystem';
import LocalFileInfo from './LocalFileInfo';
import { FileType } from '../FileInfo';

export default class LocalFileSystem implements FileSystem<LocalFileInfo> {
  static create(): Promise<LocalFileSystem> {
    return Promise.resolve(new LocalFileSystem());
  }

  async list(path: string): Promise<LocalFileInfo[]> {
    const files = await readdir(path);
    return Promise.all(files.map(async (fileName) => new LocalFileInfo(fileName, await stat(join(path, fileName)))));
  }

  put(src: NodeJS.ReadableStream, toPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const writeStream = createWriteStream(toPath);
        src.pipe(writeStream);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  get(path: string): Promise<Buffer> {
    return readFile(path);
  }

  readToStream(path: string): Promise<NodeJS.ReadableStream> {
    const stream = createReadStream(path);
    return new Promise((resolve, reject) => {
      stream.once('error', (err) => reject(err));
      stream.once('end', () => resolve(stream));
    });
  }

  async mkdir(path: string, recursive: boolean): Promise<void> {
    await mkdir(path, { recursive });
  }

  async rmdir(path: string, recursive: boolean): Promise<void> {
    if (recursive) {
      await rm(path, { recursive: true, force: true });
    } else {
      await rm(path);
    }
  }

  async delete(path: string): Promise<void> {
    await rm(path);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await rename(oldPath, newPath);
  }

  async exists(path: string): Promise<false | FileType> {
    try {
      return LocalFileInfo.getType(await stat(path));
    } catch (e) {
      if (e?.code === 'ENOENT') {
        return false;
      }
      throw e;
    }
  }

  async close(): Promise<void> {
    // no-op
  }
}
