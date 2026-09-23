import ImageCanvas from "../components/ImageCanvas";
import { useData } from "../context/DataContext";
import MarkInfo from "../components/MarkInfo";

export default function AnnotateTab({ image, onBack, onNext }) {
  const { data, actions } = useData();

  const visible = data.labels.filter((l) => l.imageId === image.id && l.status !== "deleted");
  const drafts = visible.filter((l) => l.status === "draft").sort((a, b) => a.number - b.number);
  const savedCount = visible.length - drafts.length;

  function undoLast() {
    const last = drafts[drafts.length - 1];
    if (last) actions.removeDraft(last.id);
  }

  return (
    <div className="tab-content">
      <h2>Mark points or areas on the image</h2>
      <div className="mode-hint muted">
        <span>
          <span className="kbd">Click</span> mark a point
        </span>
        <span>
          <span className="kbd">Click & drag</span> select an area
        </span>
        <span>
          <span className="kbd">Drag</span> the <span className="dot draft" /> number circle to move it
        </span>
        <span>
          <span className="dot active" /> blue = already saved
        </span>
      </div>

      <div className="two-col">
        <div className="canvas-panel">
          <ImageCanvas
            image={image}
            labels={visible}
            editable
            onAdd={(x, y, area) => actions.addMarker(image.id, x, y, area)}
            onMove={actions.moveLabel}
          />
        </div>

        <aside className="side-panel">
          <h3>New marks ({drafts.length})</h3>
          {drafts.length === 0 ? (
            <p className="muted small">No new marks yet. Click for a point, or drag to select an area.</p>
          ) : (
            <ul className="point-list">
              {drafts.map((l) => (
                <li key={l.id}>
                  <span className="num-badge draft">{l.number}</span>
                  <MarkInfo label={l} />
                  <button className="btn btn-small btn-danger-outline" onClick={() => actions.removeDraft(l.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="button-row">
            <button className="btn btn-small" onClick={undoLast} disabled={!drafts.length}>
              Undo last
            </button>
            <button
              className="btn btn-small"
              onClick={() => drafts.forEach((d) => actions.removeDraft(d.id))}
              disabled={!drafts.length}
            >
              Clear all new
            </button>
          </div>
          {savedCount > 0 && <p className="muted small">{savedCount} point(s) already saved for this image.</p>}
        </aside>
      </div>

      <div className="nav-row">
        <button className="btn" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={!drafts.length && !savedCount}>
          Next →
        </button>
      </div>
    </div>
  );
}
