import { ipcRenderer, contextBridge } from "electron";
import * as fs from "node:fs";
const sqlite3 = require("better-sqlite3");
const db = new sqlite3("./demo.db", { verbose: console.log() });

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

const API = {
  getNums: (num: number) => {
    ipcRenderer.send("num", num);
  },
  getDB: () => {
    const stmt = db.prepare("SELECT * FROM customers").all();
    return stmt;
  },
  addToDb: (name: string) => {
    const insertQuery = db.prepare("INSERT INTO customers (name) VALUES (?)");
    insertQuery.run(name);
  },
  getFilePath: (file: File) => {
    fs.readFile(file.path, "utf8", () => {
      console.log("File contents:", file.path);
    });
  },
  readDirectory: (directory: File) => {
    fs.readdir(directory.path, { recursive: true }, (err, files) => {
      if (err) console.log(err);
      else {
        console.log("Current directory filenames:");
        files.forEach((file) => console.log(file));
      }
    });
  },
};

contextBridge.exposeInMainWorld("electronAPI", API);
