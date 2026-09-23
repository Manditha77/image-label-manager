import { useState } from "react";
import { useData } from "../context/DataContext";
import { formatDateTime } from "../utils/helpers";

const STATUS_TEXT = { pending: "Pending", approved: "Accepted", rejected: "Rejected" };

export default function HistoryTab() {
  const { data } = useData();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const rows = data.requests
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [r.code, r.imageName, r.requestedBy, r.reviewedBy, r.reason, r.reviewReason, ...r.labels.map((l) => l.name)]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(q));
    })
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)); // newest first

  return (
    <div className="tab-content">
      <h2>Delete history</h2>

      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          className="search-input"
          placeholder="Search by name, reason, request ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted small">{rows.length} record(s)</span>
      </div>

      {rows.length === 0 ? (
        <p className="muted">No history yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Image</th>
                <th>Labels</th>
                <th>Requested by</th>
                <th>Requested at</th>
                <th>Delete reason</th>
                <th>Status</th>
                <th>Approver</th>
                <th>Decision at</th>
                <th>Approver reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="nowrap">{r.code}</td>
                  <td>{r.imageName}</td>
                  <td>
                    {r.labels.map((l) => (
                      <div key={l.number} className="nowrap">
                        #{l.number} {l.name || <em className="muted">(unnamed)</em>}
                      </div>
                    ))}
                  </td>
                  <td>{r.requestedBy}</td>
                  <td className="nowrap">{formatDateTime(r.requestedAt)}</td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`status-badge ${r.status}`}>{STATUS_TEXT[r.status]}</span>
                  </td>
                  <td>{r.reviewedBy || "—"}</td>
                  <td className="nowrap">{formatDateTime(r.reviewedAt)}</td>
                  <td>{r.reviewReason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
