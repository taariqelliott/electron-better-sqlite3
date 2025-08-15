import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  screen,
} from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initialize, enable } from "@electron/remote/main";
import Database from "better-sqlite3";
import fs from "fs";

const [width, height] = [900, 675];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;

initialize();

let db: Database.Database;

function setupDatabase(): void {
  let dbPath: string;
  const isDev = !app.isPackaged;

  if (isDev) {
    dbPath = path.join(process.cwd(), "demo.db");
  } else {
    const userDbPath = path.join(app.getPath("userData"), "demo.db");
    if (!fs.existsSync(userDbPath)) {
      const packagedDbPath = path.join(process.resourcesPath, "demo.db");
      if (fs.existsSync(packagedDbPath)) {
        fs.copyFileSync(packagedDbPath, userDbPath);
      }
    }
    dbPath = userDbPath;
  }

  db = new Database(dbPath);

  db.prepare(
    `CREATE TABLE IF NOT EXISTS customers (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`
  ).run();
}

function createWindow(): void {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    height: height,
    width: width,
    minWidth: width,
    minHeight: height,
    maxWidth: screen.getPrimaryDisplay().workAreaSize.width,
    maxHeight: screen.getPrimaryDisplay().workAreaSize.height,
  });

  enable(win.webContents);

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

ipcMain.handle("db-get-customers", (): any[] => {
  try {
    return db.prepare("SELECT * FROM customers").all();
  } catch (err) {
    console.error("Error fetching DB:", err);
    return [];
  }
});

ipcMain.handle(
  "db-add-customer",
  (
    _event: IpcMainInvokeEvent,
    uuid: string,
    name: string
  ): { success: boolean; error?: string } => {
    try {
      db.prepare("INSERT INTO customers (uuid, name) VALUES (? , ?)").run(
        uuid,
        name
      );
      return { success: true };
    } catch (err) {
      console.error("Error inserting to DB:", err);
      return { success: false, error: (err as Error).message };
    }
  }
);

ipcMain.handle(
  "db-delete-customer",
  (
    _event: IpcMainInvokeEvent,
    uuid: string,
    name: string
  ): { success: boolean; error?: string } => {
    try {
      db.prepare("DELETE FROM customers WHERE uuid = ? AND name = ?").run(
        uuid,
        name
      );
      return { success: true };
    } catch (err) {
      console.error("Error Deleting to DB:", err);
      return { success: false, error: (err as Error).message };
    }
  }
);

ipcMain.handle(
  "read-directory",
  async (_event: IpcMainInvokeEvent, dirPath: string): Promise<string[]> => {
    try {
      const filesArray: string[] = [];
      const files = await fs.promises.readdir(dirPath, { recursive: true });
      files.forEach((file) => {
        if (!file.toString().includes(".DS_Store")) {
          filesArray.push(file.toString());
        }
      });
      return filesArray;
    } catch (err) {
      console.error("Error reading directory:", err);
      throw err;
    }
  }
);

app.whenReady().then(() => {
  setupDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
