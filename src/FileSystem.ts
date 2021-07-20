import FileInfo, { FileType } from './FileInfo';

export default interface FileSystem<TFileInfo extends FileInfo> {
  list(path: string): Promise<TFileInfo[]>;
  put(src: NodeJS.ReadableStream, toPath: string): Promise<void>;
  get(path: string): Promise<Buffer>;
  readToStream(path: string): Promise<NodeJS.ReadableStream>;
  mkdir(path: string, recursive: boolean): Promise<void>;
  rmdir(path: string, recursive: boolean): Promise<void>;
  delete(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  exists(path: string): Promise<FileType | false>;

  // In the far future, this could even implement the AsyncDisposable interface.
  // https://github.com/tc39/proposal-explicit-resource-management
  close(): Promise<void>;
}
