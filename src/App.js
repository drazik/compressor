import "./App.css";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

function App() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) => ({ path: file.path, compressing: true }))
    );

    window.electron.compressImages(acceptedFiles.map((file) => file.path));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    window.electron.onImageCompressed((_event, filePath) =>
      setFiles((prevFiles) => {
        return prevFiles.map((file) => {
          if (file.path === filePath) {
            return { ...file, compressing: false };
          }

          return file;
        });
      })
    );
  }, []);

  console.log(files);

  return (
    <div className="App">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag n drop some files here</p>
        )}
      </div>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            {file.path} {file.compressing ? "Compressing..." : "Done"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
