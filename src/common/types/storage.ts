export interface FileData {
  filename: string;
  fileData: ArrayBufferLike;
}

export interface FileStorage {
  upload(name: string, data: FileData): Promise<void>;
  delete(filename: string): Promise<void>;
  getObjectUri(name: string, filename: string): string;
}
