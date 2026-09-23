# Image Label Manager

React (JavaScript) + Vite frontend for marking numbered points on photos, naming them, and deleting them through an approval workflow.

## How to run

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo accounts

| Username | Password | Role |
|---|---|---|
| user | user123 | User (uploads, marks, names, requests delete) |
| kasun | kasun123 | User |
| boss | boss123 | Approver (accepts / rejects delete requests) |

**Tip:** each browser tab has its own login. Log in as `user` in one tab and as `boss` in another tab. Changes appear in the other tab immediately.

## Flow

1. **Login**: validates the username and password.
2. **Upload**: upload a JPEG/PNG by clicking or drag-and-drop. Other file types are rejected. Earlier photos are listed and can be reopened.
3. **Mark points**: click anywhere on the image to add a numbered arrow (1, 2, 3...). Drag the number circle to move it. There's also undo / remove.
4. **Confirm & save**: shows the points to be saved. "Save points" asks for Yes/No confirmation.
5. **Labels**: give each number a name, and edit it anytime. Delete a single label, or select several / select all and delete them together. Every delete asks for a **reason** and creates a **pending approval request**. The label stays and shows "pending" until an approver decides.
   - **Rejected**: the label stays, and the rejection (who, when, why) is shown under it.
   - **Accepted**: the label is removed.
6. **Approvals** (approver only): see pending requests with the image and highlighted labels. Accept or Reject, both with a required reason.
7. **History**: every delete request with its request ID, labels, requested by / at, delete reason, status, approver, decision time and approver reason. It can be filtered and searched.

## Project structure

```
src/
  context/AuthContext.jsx   login state (sessionStorage = separate login per tab)
  context/DataContext.jsx   all data + actions (useReducer), saved to localStorage
  components/ImageCanvas.jsx   image + SVG overlay for arrows and numbers, click to add, drag to move
  components/Modal, ConfirmModal, ReasonModal
  pages/LoginPage.jsx, Workspace.jsx (tabs)
  tabs/UploadTab, AnnotateTab, ConfirmTab, LabelsTab, ApprovalsTab, HistoryTab
  utils/   users, storage, image processing, helpers
```

## Design decisions / assumptions

- **No backend yet**, so data is stored in the browser (localStorage) so the whole flow works. All data access goes through `DataContext` and `utils/storage.js`, so switching to a REST API only changes those files.
- Point positions are stored as **percentages (0–1)** of the image size, so the arrows stay in the right place at any screen size.
- Uploaded images are resized to max 1600px (as JPEG) to fit in browser storage.
- Label numbers are never reused for the same image, so history stays unambiguous.
- A label with a pending request can't be edited or deleted again until it's decided.
- One request can cover several labels. The approver accepts or rejects the whole request.

## Future improvements

- Backend (Node/Express or Spring Boot + database) with real authentication (JWT) and image storage.
- Approver notifications, and editing point positions after saving.
