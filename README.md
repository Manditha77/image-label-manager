# Image Label Manager

A React application for annotating images with numbered points and areas, naming them, and managing deletions through an approval workflow with a full audit history.

Built with **React 19** and **Vite**, in plain JavaScript. It runs entirely in the browser with no backend.

---

## Features

- **Authentication**: login with field validation, clear error messages, show/hide password, and a Caps Lock warning. Access depends on the role (User / Admin). Logout asks for confirmation.
- **Image upload**: JPEG and PNG only, checked by file type and extension, up to 10 MB. Supports click or drag-and-drop. Previously uploaded images can be reopened.
- **Annotation**
  - **Click** to mark a point.
  - **Click and drag** to select an area.
  - Each mark gets a numbered arrow (1, 2, 3...). The number can be dragged to a clearer position.
  - Undo, remove, or clear marks before saving.
- **Confirm & save**: marks are saved only after a Yes/No confirmation.
- **Label management**: name and edit labels, and select one, several, or all labels to delete.
- **Approval workflow**
  - Every delete request needs a **reason** and stays **pending** until an admin decides.
  - The admin can **accept** or **reject**, and must also give a reason.
  - A rejected request shows the admin's name, the time, and the reason under the label. An accepted request removes the label.
- **History**: a full audit trail showing the request ID, labels, requester, request time, delete reason, status, reviewer, decision time, and the reviewer's reason. It can be filtered and searched.

## Getting started

**Requirements:** Node.js 18 or later

```bash
git clone https://github.com/Manditha77/image-label-manager.git
cd image-label-manager
npm install
npm run dev
```

Open **http://localhost:5173**.

### Test accounts

| Role  | Username | Password | Access |
|-------|----------|----------|--------|
| User  | `user`   | `user123`  | Upload, annotate, name labels, request deletion |
| Admin | `admin`  | `admin123` | Review (accept / reject) delete requests, view history |

> **Tip:** each browser tab keeps its own session. Sign in as `user` in one tab and `admin` in another to see the full workflow. Changes appear in the other tab immediately.

## How to use

1. Sign in as **user** and upload a photo.
2. **Mark points**: click to mark a point, or drag to select an area.
3. **Confirm & save**: review the marks and confirm.
4. **Labels**: give each number a name (for example *1 – Receiver, 2 – Speaker, 3 – Display*). To delete labels, select them and enter a reason.
5. Sign in as **admin** in another tab. Open **Approvals** and accept or reject each request with a reason.
6. Open **History** to see the complete record of requests and decisions.

## Project structure

```
src/
├── main.jsx, App.jsx        App entry; shows Login or Workspace based on the session
├── pages/
│   ├── LoginPage.jsx        Sign-in screen
│   └── Workspace.jsx        Header, role-based tabs, logout confirmation
├── tabs/
│   ├── UploadTab.jsx        Upload and select images
│   ├── AnnotateTab.jsx      Mark points and areas
│   ├── ConfirmTab.jsx       Review and confirm marks
│   ├── LabelsTab.jsx        Name, edit, select, and request deletion
│   ├── ApprovalsTab.jsx     Admin review of delete requests
│   └── HistoryTab.jsx       Audit history with filter and search
├── components/
│   ├── ImageCanvas.jsx      Image with an SVG overlay for arrows, numbers, and areas
│   ├── Modal.jsx, ConfirmModal.jsx, ReasonModal.jsx
│   └── MarkInfo.jsx
├── context/
│   ├── AuthContext.jsx      Session state (login / logout)
│   └── DataContext.jsx      Application state and actions (useReducer)
└── utils/                   Users, storage, image validation/resizing, helpers
```

## Design decisions

- **Centralised state:** all data changes go through a single reducer in `DataContext`. Business rules are checked before each action: role checks, a required reason, and no duplicate or conflicting requests.
- **Resolution-independent marks:** positions are stored as fractions (0–1) of the image size, so marks stay correct at any screen size.
- **Label lifecycle:** `draft → active → pending → deleted`. A rejected request returns the label to `active`.
- **Soft delete:** accepted deletions are hidden, not erased, so the history stays complete. Label numbers are never reused within an image.
- **Batch requests:** one request can cover several labels, and the admin decides on the request as a whole.
- **Persistence:** data is stored in `localStorage`, and the session in `sessionStorage` (one session per tab). All data access goes through `DataContext` and `AuthContext`, so replacing them with a REST API needs no changes to the UI components.
- **Image handling:** uploads are resized to a maximum of 1600px before storage.

## Limitations

- This is a frontend-only implementation. Credentials are defined on the client and data is stored in the browser, so it is intended for demonstration only.
- Data is local to one browser and is not shared between devices.

## Future improvements

- Backend API (Node.js/Express or Spring Boot) with a MySQL database, hashed passwords, and JWT authentication
- Server-side image storage
- Notifications for approvers
- Editing mark positions after saving
- Unit and end-to-end tests