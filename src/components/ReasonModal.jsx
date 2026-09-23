import { useState } from "react";
import Modal from "./Modal";

const MIN_LENGTH = 5;

// Asks for a reason (used for delete requests and for approve / reject)
export default function ReasonModal({
  title,
  description,
  placeholder = "Type the reason...",
  submitText = "Submit",
  submitClass = "btn-primary",
  onSubmit,
  onClose,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const text = reason.trim();
    if (text.length < MIN_LENGTH) {
      setError(`Please enter a reason (at least ${MIN_LENGTH} characters).`);
      return;
    }
    onSubmit(text);
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {description && <div className="modal-description">{description}</div>}
        <label className="field">
          <span>Reason *</span>
          <textarea
            autoFocus
            rows={4}
            value={reason}
            placeholder={placeholder}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <div className="modal-footer inline">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`btn ${submitClass}`}>
            {submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
