/* eslint react/prop-types: "off" */
import { useEffect, useState } from "react";
import "../../styles/ImageFilePicker.css";

function ImageFilePicker({ id, files, onFilesChange, onRemoveFile, maxFiles = 3 }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const filePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(filePreviews);

    return () => {
      filePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    onFilesChange(selectedFiles);
  }

  return (
    <div className="image-file-picker">
      <input
        id={id}
        className="image-file-picker-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleChange}
      />
      <label className="image-file-picker-button" htmlFor={id}>
        <i className="bi bi-images" aria-hidden="true"></i>
        Choose images
      </label>
      <span className="image-file-picker-hint">
        Up to {maxFiles} images, JPEG, PNG, or WebP; 5 MB maximum each.
      </span>

      {previews.length > 0 && (
        <div className="image-file-preview-list" aria-live="polite">
          {previews.map(({ file, url }, index) => (
            <div className="image-file-preview" key={`${file.name}-${file.lastModified}-${index}`}>
              <img src={url} alt={`Preview of ${file.name}`} />
              <span title={file.name}>{file.name}</span>
              {onRemoveFile && (
                <button
                  type="button"
                  className="image-file-remove"
                  onClick={() => onRemoveFile(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageFilePicker;
