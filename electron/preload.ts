import { ipcRenderer, contextBridge, IpcRendererEvent } from "electron";

const API = {
  getNums: (num: number): void => {
    ipcRenderer.send("num", num);
  },
  getDB: (): Promise<any> => ipcRenderer.invoke("db-get-customers"),
  addToDb: (uuid: string, name: string): Promise<any> =>
    ipcRenderer.invoke("db-add-customer", uuid, name),
  deleteFromDb: (uuid: string, name: string): Promise<any> =>
    ipcRenderer.invoke("db-delete-customer", uuid, name),
  readDirectory: (filePath: string): Promise<string[]> =>
    ipcRenderer.invoke("read-directory", filePath),
};

contextBridge.exposeInMainWorld("ipcRenderer", {
  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ): void {
    ipcRenderer.on(channel, listener);
  },
  off(channel: string, listener: (...args: any[]) => void): void {
    ipcRenderer.off(channel, listener);
  },
  send(channel: string, ...args: any[]): void {
    ipcRenderer.send(channel, ...args);
  },
  invoke(channel: string, ...args: any[]): Promise<any> {
    return ipcRenderer.invoke(channel, ...args);
  },
});

contextBridge.exposeInMainWorld("electronAPI", API);
