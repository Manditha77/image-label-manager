import { useState } from "react";
import ImageCanvas from "../components/ImageCanvas";
import ConfirmModal from "../components/ConfirmModal";
import { useData } from "../context/DataContext";
import MarkInfo from "../components/MarkInfo";

export default function ConfirmTab({ image, onBack, onNext }) {
  const { data, actions } = useData();
  const [showConfirm, setShowConfirm] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const visible = data.labels.filter((l) => l.imageId === image.id && l.status !== "deleted");
  const drafts = visible.filter((l) => l.status === "draft").sort((a, b) => a.number - b.number);

  function handleYes() {
    const count = drafts.length;
    actions.confirmDrafts(image.id);
    setShowConfirm(false);
    setSavedMessage(`${count} mark(s) saved successfully.`);
  }

  return (
    <div className="tab-content">
      <h2>Confirm & save points</h2>

      <div className="two-col">
        <div className="canvas-panel">
          <ImageCanvas image={image} labels={visible} />
        </div>

        <aside className="side-panel">
          {drafts.length > 0 ? (
            <>
              <h3>Marks to save ({drafts.length})</h3>
              <ul className="point-list">
                {drafts.map((l) => (
                  <li key={l.id}>
                    <span className="num-badge draft">{l.number}</span>
                    <MarkInfo label={l} />
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-block" onClick={() => setShowConfirm(true)}>
                Save points
              </button>
            </>
          ) : (
            <p className="muted">No unsaved points. Go back to add more, or continue to name your labels.</p>
          )}
          {savedMessage && <p className="success-text">{savedMessage}</p>}
        </aside>
      </div>

      <div className="nav-row">
        <button className="btn" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={drafts.length > 0}>
          {drafts.length > 0 ? "Save points first" : "Next: Name labels →"}
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Save marks?"
          message={
            <p>
              Do you want to save <strong>{drafts.length}</strong> point(s) (
              {drafts.map((d) => `#${d.number}`).join(", ")}) on <strong>{image.name}</strong>?
            </p>
          }
          yesText="Yes, save"
          noText="No"
          onYes={handleYes}
          onNo={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
