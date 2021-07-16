export default interface FileInfo {
  readonly name: string;
  readonly size: number;
  readonly type: FileType;
  readonly isDirectory: boolean;
}

export enum FileType {
  File,
  Directory,
  Link,
}
