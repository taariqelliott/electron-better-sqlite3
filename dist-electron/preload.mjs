"use strict";
const electron = require("electron");
const fs = require("node:fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const sqlite3 = require("better-sqlite3");
const db = new sqlite3("./demo.db", { verbose: console.log() });
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
const API = {
  getNums: (num) => {
    electron.ipcRenderer.send("num", num);
  },
  getDB: () => {
    const stmt = db.prepare("SELECT * FROM customers").all();
    return stmt;
  },
  addToDb: (name) => {
    const insertQuery = db.prepare("INSERT INTO customers (name) VALUES (?)");
    insertQuery.run(name);
  },
  getFilePath: (file) => {
    fs__namespace.readFile(file.path, "utf8", () => {
      console.log("File contents:", file.path);
    });
  },
  readDirectory: (directory) => {
    fs__namespace.readdir(directory.path, { recursive: true }, (err, files) => {
      if (err) console.log(err);
      else {
        console.log("Current directory filenames:");
        files.forEach((file) => console.log(file));
      }
    });
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", API);
