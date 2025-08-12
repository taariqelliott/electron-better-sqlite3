import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    electronAPI: any;
  }
}

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

type DBDataType = {
  id: number;
  name: string;
};

export default function App() {
  const [dbData, setDBData] = useState<DBDataType[] | null>([]);
  const [name, setName] = useState<string>("");
  const [errorActive, setErrorActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInput = useRef(null);

  const getDBData = () => {
    setDBData(window.electronAPI.getDB());
  };

  const sendQuery = async () => {
    if (name.trim() === "") {
      setErrorActive(true);
      setTimeout(() => {
        setErrorActive(false);
      }, 1000);
      return;
    }
    try {
      await window.electronAPI.addToDb(name.trim());
      getDBData();
      setName("");
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFileData = (file: File) => {
    window.electronAPI.getFilePath(file);
  };

  const readDir = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    let fileName = files[0].name;
    let directoryPath = files[0].path.split(fileName).join("");
    window.electronAPI.readDirectory({ path: directoryPath });
  };

  useEffect(() => {
    setDBData(window.electronAPI.getDB());
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen gap-2 py-2 flex-col overflow-y-scroll">
      <div className="flex items-center justify-center gap-5 flex-col">
        <div className="flex items-center justify-center gap-1 flex-col">
          <div className="flex justify-center gap-2 mb-2">
            <p>Name entered: </p>
            <span className="badge badge-secondary">
              {name ? name : "add a name"}
            </span>
          </div>
          <input
            ref={inputRef}
            value={name}
            className="input input-primary"
            type="text"
            name=""
            id=""
            placeholder="Enter a name..."
            onChange={(event) => {
              setName(event.target.value);
            }}
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
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const files = event.target.files;
          if (files?.length === 0 || !files) return;
          if (files) {
            getFileData(files[0]);
          }
        }}
      />

      <input
        type="file"
        className="file-input file-input-accent"
        directory=""
        webkitdirectory=""
        onChange={readDir}
        ref={folderInput}
      />

      <p className="font-mono">DB Data</p>
      <div className="flex items-center justify-center w-[50%] gap-3 mx-auto flex-wrap">
        {dbData &&
          dbData.map((item) => (
            <div key={String(item.name + "_" + item.id)}>
              <span className="badge font-mono badge-accent">{item.id}</span>
              <span className="badge text-base-100 font-mono badge-primary">
                {item.name.toUpperCase()}
              </span>
            </div>
          ))}
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
