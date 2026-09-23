import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { processImageFile, validateImageFile } from "../utils/image";
import { formatDateTime } from "../utils/helpers";

export default function UploadTab({ activeImage, onSelectImage, onNext }) {
  const { user } = useAuth();
  const { data, actions } = useData();
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file) {
    setError("");
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      setLoading(true);
      const processed = await processImageFile(file);
      const image = actions.addImage(file, processed, user);
      onSelectImage(image.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = ""; // allow selecting the same file again
    }
  }

  function countActive(imageId) {
    return data.labels.filter((l) => l.imageId === imageId && l.status !== "deleted" && l.status !== "draft").length;
  }

  const images = [...data.images].reverse(); // newest first

  return (
    <div className="tab-content">
      <h2>Upload a photo</h2>
      <p className="muted">Allowed formats: JPEG and PNG.</p>

      <div
        className={`dropzone ${dragOver ? "drag-over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {loading ? <p>Processing image...</p> : <p><strong>Click to choose a photo</strong> or drag and drop it here</p>}
      </div>
      {error && <p className="error-text">{error}</p>}

      {activeImage && (
        <div className="selected-image">
          <img src={activeImage.dataUrl} alt={activeImage.name} />
          <div>
            <p>
              <strong>Selected:</strong> {activeImage.name}
            </p>
            <p className="muted small">
              {activeImage.width} × {activeImage.height}px · uploaded by {activeImage.uploadedBy} ·{" "}
              {formatDateTime(activeImage.uploadedAt)}
            </p>
            <button className="btn btn-primary" onClick={onNext}>
              Open image & mark points →
            </button>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <>
          <h3>Uploaded photos</h3>
          <div className="gallery">
            {images.map((img) => (
              <button
                key={img.id}
                className={`gallery-item ${activeImage?.id === img.id ? "selected" : ""}`}
                onClick={() => onSelectImage(img.id)}
                title={img.name}
              >
                <img src={img.dataUrl} alt={img.name} />
                <span className="gallery-name">{img.name}</span>
                <span className="muted small">{countActive(img.id)} labels</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
