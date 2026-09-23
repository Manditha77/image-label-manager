import { useState } from "react";
import ImageCanvas from "../components/ImageCanvas";
import ReasonModal from "../components/ReasonModal";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatDateTime, labelText } from "../utils/helpers";

export default function LabelsTab({ image }) {
  const { user } = useAuth();
  const { data, actions } = useData();
  const [selected, setSelected] = useState(new Set());
  const [deleteTargets, setDeleteTargets] = useState(null); // labels to delete (opens the reason modal)
  const [message, setMessage] = useState("");

  const labels = data.labels
    .filter((l) => l.imageId === image.id && (l.status === "active" || l.status === "pending"))
    .sort((a, b) => a.number - b.number);

  const selectable = labels.filter((l) => l.status === "active"); // pending ones can't be selected
  const selectedLabels = selectable.filter((l) => selected.has(l.id));
  const allSelected = selectable.length > 0 && selectedLabels.length === selectable.length;

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((l) => l.id)));
  }

  function submitDeleteRequest(reason) {
    actions.requestDelete(deleteTargets, image, reason, user);
    setMessage(
      `Delete request sent for ${deleteTargets.map((l) => `#${l.number}`).join(", ")}. Waiting for approval.`,
    );
    setSelected(new Set());
    setDeleteTargets(null);
  }

  const findRequest = (id) => data.requests.find((r) => r.id === id);

  return (
    <div className="tab-content">
      <h2>Name your labels</h2>
      <p className="muted">Give each numbered point a name. You can edit names anytime.</p>

      <div className="two-col">
        <div className="canvas-panel">
          <ImageCanvas image={image} labels={labels} highlightIds={new Set(selectedLabels.map((l) => l.id))} />
        </div>

        <div className="side-panel wide">
          {labels.length === 0 ? (
            <p className="muted">No saved labels for this image yet. Mark and save points first.</p>
          ) : (
            <>
              <div className="toolbar">
                <label className="checkbox">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!selectable.length} />
                  Select all
                </label>
                <button
                  className="btn btn-danger"
                  disabled={!selectedLabels.length}
                  onClick={() => setDeleteTargets(selectedLabels)}
                >
                  Delete selected ({selectedLabels.length})
                </button>
              </div>

              <ul className="label-list">
                {labels.map((label) => (
                  <LabelRow
                    key={label.id}
                    label={label}
                    checked={selected.has(label.id)}
                    onToggle={() => toggle(label.id)}
                    onRename={(name) => {
                      actions.renameLabel(label.id, name);
                      setMessage(`Label #${label.number} saved as "${name}".`);
                    }}
                    onDelete={() => setDeleteTargets([label])}
                    pendingRequest={label.pendingRequestId ? findRequest(label.pendingRequestId) : null}
                  />
                ))}
              </ul>
            </>
          )}
          {message && <p className="success-text">{message}</p>}
        </div>
      </div>

      {deleteTargets && (
        <ReasonModal
          title="Request to delete"
          description={
            <>
              <p>
                You are requesting to delete: <strong>{deleteTargets.map(labelText).join(", ")}</strong>
              </p>
              <p className="muted small">This needs approval from an approver before the label is deleted.</p>
            </>
          }
          placeholder="Why do you want to delete this?"
          submitText="Send delete request"
          submitClass="btn-danger"
          onSubmit={submitDeleteRequest}
          onClose={() => setDeleteTargets(null)}
        />
      )}
    </div>
  );
}

function LabelRow({ label, checked, onToggle, onRename, onDelete, pendingRequest }) {
  const [editing, setEditing] = useState(!label.name); // unnamed labels start in edit mode
  const [value, setValue] = useState(label.name);
  const [error, setError] = useState("");
  const isPending = label.status === "pending";

  function save() {
    const name = value.trim();
    if (!name) {
      setError("Name cannot be empty.");
      return;
    }
    onRename(name);
    setError("");
    setEditing(false);
  }

  function cancel() {
    setValue(label.name);
    setError("");
    setEditing(false);
  }

  return (
    <li className={`label-row ${isPending ? "pending" : ""}`}>
      <div className="label-main">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={isPending}
          aria-label={`Select label ${label.number}`}
        />
        <span className={`num-badge ${label.status}`}>{label.number}</span>

        {editing && !isPending ? (
          <>
            <input
              className="name-input"
              value={value}
              placeholder="Enter a name (e.g. Receiver)"
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape" && label.name) cancel();
              }}
            />
            <button className="btn btn-small btn-primary" onClick={save}>
              Save
            </button>
            {label.name && (
              <button className="btn btn-small" onClick={cancel}>
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <span className="label-name">{label.name || <em className="muted">(unnamed)</em>}</span>
            <button className="btn btn-small" onClick={() => setEditing(true)} disabled={isPending}>
              Edit
            </button>
          </>
        )}
        <button className="btn btn-small btn-danger-outline" onClick={onDelete} disabled={isPending}>
          Delete
        </button>
      </div>

      {error && <p className="error-text small">{error}</p>}

      {isPending && pendingRequest && (
        <div className="notice notice-pending">
          ⏳ <strong>Delete pending approval</strong> ({pendingRequest.code}) — requested by{" "}
          {pendingRequest.requestedBy} on {formatDateTime(pendingRequest.requestedAt)}.
          <br />
          Reason: {pendingRequest.reason}
        </div>
      )}

      {!isPending && label.lastRejection && (
        <div className="notice notice-rejected">
          ✖ <strong>Delete request rejected</strong> by {label.lastRejection.by} on{" "}
          {formatDateTime(label.lastRejection.at)}.
          <br />
          Reason: {label.lastRejection.reason}
        </div>
      )}
    </li>
  );
}
