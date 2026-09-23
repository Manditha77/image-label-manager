import { useState } from "react";
import ImageCanvas from "../components/ImageCanvas";
import ReasonModal from "../components/ReasonModal";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatDateTime } from "../utils/helpers";

export default function ApprovalsTab() {
  const { user } = useAuth();
  const { data, actions } = useData();
  const [review, setReview] = useState(null); // { request, decision }
  const [message, setMessage] = useState("");

  const pending = data.requests
    .filter((r) => r.status === "pending")
    .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt)); // oldest first

  function submitReview(reason) {
    actions.reviewRequest(review.request.id, review.decision, reason, user);
    setMessage(`${review.request.code} was ${review.decision === "approved" ? "approved" : "rejected"}.`);
    setReview(null);
  }

  return (
    <div className="tab-content">
      <h2>Pending delete requests ({pending.length})</h2>
      {message && <p className="success-text">{message}</p>}

      {pending.length === 0 && <p className="muted">No requests waiting for approval.</p>}

      <div className="request-list">
        {pending.map((request) => {
          const image = data.images.find((i) => i.id === request.imageId);
          const labels = data.labels.filter((l) => request.labelIds.includes(l.id));
          return (
            <div key={request.id} className="request-card">
              {image && (
                <div className="request-image">
                  <ImageCanvas image={image} labels={labels} highlightIds={new Set(request.labelIds)} />
                </div>
              )}
              <div className="request-info">
                <h3>
                  {request.code} <span className="status-badge pending">Pending</span>
                </h3>
                <p>
                  <strong>Image:</strong> {request.imageName}
                </p>
                <p>
                  <strong>Labels:</strong>{" "}
                  {request.labels.map((l) => `#${l.number} ${l.name || "(unnamed)"}`).join(", ")}
                </p>
                <p>
                  <strong>Requested by:</strong> {request.requestedBy} on {formatDateTime(request.requestedAt)}
                </p>
                <p>
                  <strong>Reason:</strong> {request.reason}
                </p>
                <div className="button-row">
                  <button className="btn btn-success" onClick={() => setReview({ request, decision: "approved" })}>
                    Accept
                  </button>
                  <button className="btn btn-danger" onClick={() => setReview({ request, decision: "rejected" })}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {review && (
        <ReasonModal
          title={review.decision === "approved" ? `Accept ${review.request.code}` : `Reject ${review.request.code}`}
          description={
            <p>
              {review.decision === "approved"
                ? "The selected labels will be permanently deleted."
                : "The labels will stay, and the user will see your reason."}
            </p>
          }
          placeholder={review.decision === "approved" ? "Why are you accepting?" : "Why are you rejecting?"}
          submitText={review.decision === "approved" ? "Accept" : "Reject"}
          submitClass={review.decision === "approved" ? "btn-success" : "btn-danger"}
          onSubmit={submitReview}
          onClose={() => setReview(null)}
        />
      )}
    </div>
  );
}
