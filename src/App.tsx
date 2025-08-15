import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { faker } from "@faker-js/faker";

declare global {
  interface Window {
    electronAPI: {
      getDB: () => Promise<DBDataType[]>;
      addToDb: (
        uuid: string,
        name: string
      ) => Promise<{ success: boolean; error?: string }>;
      deleteFromDb: (
        uuid: string,
        name: string
      ) => Promise<{ success: boolean; error?: string }>;
      readDirectory: (dir: string) => Promise<string[]>;
    };
  }
}

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

type DBDataType = {
  uuid: string;
  name: string;
};

export default function App() {
  const [dbData, setDBData] = useState<DBDataType[] | null>([]);
  const [name, setName] = useState<string>("");
  const [errorActive, setErrorActive] = useState<boolean>(false);
  const [fileList, setFileList] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const getDBData = async () => {
    try {
      const data = await window.electronAPI.getDB();
      setDBData(data);
    } catch (err) {
      console.error("Failed to get DB data:", err);
    }
  };

  const sendQuery = async () => {
    if (name.trim() === "") {
      setErrorActive(true);
      setTimeout(() => {
        setErrorActive(false);
      }, 1500);
      return;
    }

    try {
      const result = await window.electronAPI.addToDb(
        faker.string.uuid(),
        name.trim()
      );
      if (result.success) {
        await getDBData();
        setName("");
        inputRef.current?.blur();
      } else {
        console.error("Error inserting to DB:", result.error);
      }
    } catch (error) {
      console.error("Add to DB failed:", error);
    }
  };

  const readDir = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const fileName = files[0].name;
    const directoryPath = files[0].path.split(fileName).join("");
    try {
      const filesList = await window.electronAPI.readDirectory(directoryPath);
      setFileList(filesList);
    } catch (err) {
      console.error("Error reading directory:", err);
    }
  };

  useEffect(() => {
    getDBData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen gap-2 py-2 flex-col overflow-y-scroll">
      <div className="w-full flex p-1 bg-base-100 shadow-sm absolute top-0">
        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>{" "}
            </svg>
          </button>
        </div>
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Electron-SQLite</a>
        </div>
        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              ></path>{" "}
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-5 flex-col">
        <div className="flex items-center justify-center gap-1 flex-col">
          <div className="flex justify-center gap-2 mb-2">
            <p>Name entered: </p>
            <span className="badge badge-secondary w-36">
              {name ? name : "add a name"}
            </span>
          </div>
          <input
            ref={inputRef}
            value={name}
            className="input input-primary"
            type="text"
            placeholder="Enter a name..."
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendQuery();
              }
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={sendQuery}>
          Send Query
        </button>
      </div>

      <button className="btn btn-accent" onClick={getDBData}>
        Get DB Data
      </button>

      <input
        type="file"
        className="file-input file-input-accent"
        directory=""
        webkitdirectory=""
        onChange={readDir}
        ref={folderInput}
      />

      <div className="flex items-center justify-center flex-wrap gap-3 w-[70%]">
        {fileList.map((file, idx) => (
          <div className="flex items-center justify-center">
            <div className="badge badge-accent" key={`${file}_${idx}`}>
              {idx + 1}:
            </div>
            <div className="badge badge-primary">{file}</div>
          </div>
        ))}
      </div>
      <p className="font-mono">DB Data</p>

      <div className="overflow-y-auto h-48 w-96 rounded-box border border-base-content/5 bg-base-200">
        <table className="table table-sm table-pin-rows bg-base-200">
          <thead>
            <tr>
              <th>Name</th>
              <th>UUID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dbData &&
              dbData.map((item) => (
                <tr className="hover:bg-base-300 cursor-default transition-all duration-200">
                  <td>{item.name}</td>
                  <td>{item.uuid.slice(0, 13)}</td>
                  <td
                    onClick={() => {
                      window.electronAPI.deleteFromDb(item.uuid, item.name);
                      getDBData();
                    }}
                  >
                    <span className="badge badge-primary cursor-pointer hover:opacity-70 active:scale-95 transition-all duration-150">
                      X
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {errorActive && (
        <div
          role="alert"
          className="alert alert-warning fixed bottom-2 right-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Name field is empty!</span>
        </div>
      )}
    </div>
  );
}
