Treat local, FTP and SFTP files the same way.
**100% Node.js**, no other software needed. Under the hood, this library uses the popular [ssh2-sftp-client][] and [ftp][] packages.

# Contents

- [Installation](#installation)
- [Overview](#overview)
- [API](#api)
- [Examples](#examples)

## Installation

    npm i --save @wertarbyte/local-ftp-sftp

## Overview

Class hierarchy

```
interface FileSystem
  ├── class LocalFileSystem
  ├── class FtpFileSystem
  └── class SftpFileSystem

interface FileInfo
  ├── class LocalFileInfo
  ├── class FtpFileInfo
  └── class SftpFileInfo
```

### Instantiate a FileSystem

```js
const localFileSystem = new LocalFileSystem();
const ftpFileSystem = await FtpFileSystem.create({
  host: '127.0.0.1',
  port: 21,
  user: 'user1',
  password: '12345',
  connectionOptions: {}, // optional, see below
});
const sftpFileSystem = await SftpFileSystem.create({
  host: '127.0.0.1',
  port: 22,
  user: 'user1',
  password: '12345', // optional if you configure private key authentication using the connection options
  connectionOptions: {}, // optional, see below
});
```

The `connectionOptions` option is optional and is passed through to the connect methods of the underlying [ftp][] or [ssh2-sftp-client][] instance. You can use this for advanced configuration, e.g. FTPS settings or private key authentication for SFTP.

## API

### FileSystem

```ts
interface FileSystem {
  list(path: string): Promise<FileInfo[]>;
  put(src: NodeJS.ReadableStream, toPath: string): Promise<void>;
  get(path: string): Promise<Buffer>;
  readToStream(path: string, destination: NodeJS.WritableStream): Promise<void>;
  mkdir(path: string, recursive: boolean): Promise<void>;
  rmdir(path: string, recursive: boolean): Promise<void>;
  delete(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  exists(path: string): Promise<FileType | false>;
  close(): Promise<void>;
}
```

### FileInfo

```ts
interface FileInfo {
  readonly name: string;
  readonly size: number;
  readonly type: FileType;
  readonly isDirectory: boolean;
}
```

## Examples

```js
// constants for all examples
const host = '127.0.0.1';
const port = 21; // or 22 for SFTP
const user = 'root';
const password = 'password';
```

### Listing items inside a directory

_using Promise/then/catch_

```js
// You could just replace FtpFileSystem with SftpFileSystem for SFTP instead of FTP
FtpFileSystem.create({ host, port, user, password })
  // Or: SftpFileSystem.create({ host, port, user, password })
  .then((ftpFileSystem) => {
    // List remote files
    ftpFileSystem
      .list('/home')
      .then((files) => {
        console.log('Files:', files);
      })
      .catch((err) => {
        console.log('Could not retrieve directory /home', err);
      });
  })
  .catch((err) => {
    console.log('Error while connecting to FTP server:', err);
  });
```

### Upload file from local file system

_using Promise/then/catch_

```js
var localFileSystem = new LocalFileSystem();

SftpFileSystem.create({ host, port, user, password })
  // Or: FtpFileSystem.create({ host, port, user, password })
  .then((sftpFileSystem) => {
    // Get the local file as a stream
    localFileSystem.get('/Users/dennis/catpic.jpeg').then((readStream) => {
      // Now, upload the file to the SFTP server
      sftpFileSystem.put('/home/uploaded_catpic.jpeg', readStream).then(() => {
        console.log('Important file was uploaded successfully, meow!');
      });
    });
  })
  .catch((err) => {
    console.log('Error while uploading file:', err);
  });
```

### Transfer file from FTP server to another SFTP server

_using await_

```js
const ftpFileSystem = await FtpFileSystem.create({ host, port, user, password });
const sftpFileSystem = await SftpFileSystem.create({ hort, port, user, password });

const readStream = await ftpFileSystem.get('/home/catpic.jpeg');
await sftpFileSystem.put(readStream, '/var/catpic.jpeg');
```

### Create and delete directory

_using await_

```js
const ftpFileSystem = await FtpFileSystem.create({ host, port, user, password });

// Create the directory
await ftpFileSystem.mkdir('/home/catpics');

// Create directory and sub-directories (recursively: true)
await ftpFileSystem.mkdir('/home/even/more/catpics', true);

// Delete the newly created directory (Only works on empty directories)
await ftpFileSystem.rmdir('/home/catpics');

// Delete directory with content (recursively: true)
await ftpFileSystem.rmdir('/home/even/more/catpics', true);
```

[ftp]: https://www.npmjs.com/package/ftp
[ssh2-sftp-client]: https://www.npmjs.com/package/ssh2-sftp-client
