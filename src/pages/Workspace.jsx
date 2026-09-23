import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import UploadTab from "../tabs/UploadTab";
import AnnotateTab from "../tabs/AnnotateTab";
import ConfirmTab from "../tabs/ConfirmTab";
import LabelsTab from "../tabs/LabelsTab";
import ApprovalsTab from "../tabs/ApprovalsTab";
import HistoryTab from "../tabs/HistoryTab";

// Normal users do the labelling flow. Approvers (admin) review delete requests.
const USER_TABS = [
  { id: "upload", title: "1. Upload" },
  { id: "annotate", title: "2. Mark points", needsImage: true },
  { id: "confirm", title: "3. Confirm & save", needsImage: true },
  { id: "labels", title: "4. Labels", needsImage: true },
  { id: "history", title: "History" },
];
const APPROVER_TABS = [
  { id: "approvals", title: "Approvals" },
  { id: "history", title: "History" },
];

export default function Workspace() {
  const { user, logout } = useAuth();
  const { data, storageError } = useData();
  const isApprover = user.role === "approver";
  const tabs = isApprover ? APPROVER_TABS : USER_TABS;

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [activeImageId, setActiveImageId] = useState(() => data.images.at(-1)?.id ?? null);

  const activeImage = data.images.find((i) => i.id === activeImageId) || null;
  const pendingCount = data.requests.filter((r) => r.status === "pending").length;
  const myPending = data.requests.filter((r) => r.status === "pending" && r.requestedById === user.id).length;

  function go(tabId) {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.needsImage && !activeImage) return;
    setActiveTab(tabId);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">Image Label Manager</div>
        <div className="user-info">
          <span>
            {user.name}{" "}
            <span className={`role-badge ${user.role}`}>{isApprover ? "Approver" : "User"}</span>
          </span>
          <button className="btn btn-small" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {storageError && <div className="banner-error">{storageError}</div>}

      <nav className="tabs">
        {tabs.map((tab) => {
          const disabled = tab.needsImage && !activeImage;
          const badge =
            tab.id === "approvals" ? pendingCount : tab.id === "labels" && myPending ? myPending : 0;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              disabled={disabled}
              title={disabled ? "Upload or select an image first" : ""}
              onClick={() => go(tab.id)}
            >
              {tab.title}
              {badge > 0 && <span className="tab-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      {!isApprover && activeImage && activeTab !== "upload" && activeTab !== "history" && (
        <div className="current-image-bar">
          Working on: <strong>{activeImage.name}</strong>
          <button className="link-btn" onClick={() => go("upload")}>
            change
          </button>
        </div>
      )}

      <main>
        {activeTab === "upload" && (
          <UploadTab activeImage={activeImage} onSelectImage={setActiveImageId} onNext={() => go("annotate")} />
        )}
        {activeTab === "annotate" && activeImage && (
          <AnnotateTab image={activeImage} onBack={() => go("upload")} onNext={() => go("confirm")} />
        )}
        {activeTab === "confirm" && activeImage && (
          <ConfirmTab image={activeImage} onBack={() => go("annotate")} onNext={() => go("labels")} />
        )}
        {activeTab === "labels" && activeImage && <LabelsTab key={activeImage.id} image={activeImage} />}
        {activeTab === "approvals" && <ApprovalsTab />}
        {activeTab === "history" && <HistoryTab />}
      </main>
    </div>
  );
}
