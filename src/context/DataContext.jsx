import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { EMPTY_DATA, STORAGE_KEY, loadData, saveData } from "../utils/storage";
import { clamp, nowIso, uid } from "../utils/helpers";

/*
  Data model
  ----------
  image:   { id, name, dataUrl, width, height, uploadedBy, uploadedAt }
  label:   { id, imageId, number, x, y, lx, ly, name, status, createdAt, updatedAt,
             pendingRequestId, lastRejection, deletedAt }
           x, y   = arrow tip (the point on the image), stored as 0..1 of width/height
           area   = optional selected rectangle { x, y, w, h } (0..1), null for a point
           lx, ly = position of the numbered circle
           status = "draft" (not saved yet) | "active" | "pending" (delete requested) | "deleted"
  request: { id, code, imageId, imageName, labelIds, labels: [{number, name}],
             requestedBy, requestedById, requestedAt, reason,
             status: "pending" | "approved" | "rejected", reviewedBy, reviewedAt, reviewReason }
*/

const DataContext = createContext(null);

// Put the number circle a little away from the point, towards the image centre.
// For an area, put it just above (or below) the rectangle.
function defaultLabelPosition(x, y, area) {
  const offset = 0.09;
  if (area) {
    const above = area.y - 0.07;
    const below = area.y + area.h + 0.07;
    return {
      lx: clamp(area.x + area.w / 2, 0.04, 0.96),
      ly: above >= 0.04 ? above : clamp(below, 0.04, 0.96),
    };
  }
  return {
    lx: clamp(x < 0.5 ? x + offset : x - offset, 0.04, 0.96),
    ly: clamp(y < 0.5 ? y + offset : y - offset, 0.04, 0.96),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "REPLACE_ALL":
      return action.data;

    case "ADD_IMAGE":
      return { ...state, images: [...state.images, action.image] };

    case "ADD_MARKER": {
      const { id, imageId, x, y, area, now } = action;
      // Numbers are never reused for an image (1, 2, 3 ...)
      const numbers = state.labels.filter((l) => l.imageId === imageId).map((l) => l.number);
      const number = numbers.length ? Math.max(...numbers) + 1 : 1;
      const label = {
        id,
        imageId,
        number,
        x,
        y,
        area: area || null, // { x, y, w, h } as 0..1 fractions, or null for a single point
        ...defaultLabelPosition(x, y, area),
        name: "",
        status: "draft",
        createdAt: now,
        updatedAt: now,
        pendingRequestId: null,
        lastRejection: null,
        deletedAt: null,
      };
      return { ...state, labels: [...state.labels, label] };
    }

    case "MOVE_LABEL":
      return {
        ...state,
        labels: state.labels.map((l) =>
          l.id === action.id ? { ...l, lx: action.lx, ly: action.ly } : l,
        ),
      };

    case "REMOVE_DRAFT":
      return {
        ...state,
        labels: state.labels.filter((l) => !(l.id === action.id && l.status === "draft")),
      };

    case "CONFIRM_DRAFTS":
      return {
        ...state,
        labels: state.labels.map((l) =>
          l.imageId === action.imageId && l.status === "draft"
            ? { ...l, status: "active", updatedAt: action.now }
            : l,
        ),
      };

    case "RENAME_LABEL":
      return {
        ...state,
        labels: state.labels.map((l) =>
          l.id === action.id ? { ...l, name: action.name, updatedAt: action.now } : l,
        ),
      };

    case "REQUEST_DELETE": {
      const { request } = action;
      const code = `REQ-${String(state.requests.length + 1).padStart(4, "0")}`;
      return {
        ...state,
        requests: [...state.requests, { ...request, code }],
        labels: state.labels.map((l) =>
          request.labelIds.includes(l.id)
            ? { ...l, status: "pending", pendingRequestId: request.id }
            : l,
        ),
      };
    }

    case "REVIEW_REQUEST": {
      const { requestId, decision, reason, user, now } = action;
      const request = state.requests.find((r) => r.id === requestId);
      if (!request || request.status !== "pending") return state;

      const approved = decision === "approved";
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: decision,
                reviewedBy: user.name,
                reviewedById: user.id,
                reviewedAt: now,
                reviewReason: reason,
              }
            : r,
        ),
        labels: state.labels.map((l) => {
          if (!request.labelIds.includes(l.id)) return l;
          return approved
            ? { ...l, status: "deleted", deletedAt: now, pendingRequestId: null }
            : {
                ...l,
                status: "active",
                pendingRequestId: null,
                lastRejection: { by: user.name, at: now, reason, requestCode: request.code },
              };
        }),
      };
    }

    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [data, dispatch] = useReducer(reducer, EMPTY_DATA, loadData);
  const [storageError, setStorageError] = useState("");

  // Save on every change
  useEffect(() => {
    try {
      saveData(data);
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is full. Try a smaller image or clear old data (Settings > Clear site data).",
      );
    }
  }, [data]);

  // If another tab (e.g. the admin) changes data, reload it here too
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) dispatch({ type: "REPLACE_ALL", data: loadData() });
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const actions = {
    addImage(file, processed, user) {
      const image = {
        id: uid(),
        name: file.name,
        ...processed,
        uploadedBy: user.name,
        uploadedAt: nowIso(),
      };
      dispatch({ type: "ADD_IMAGE", image });
      return image;
    },
    addMarker(imageId, x, y, area = null) {
      dispatch({ type: "ADD_MARKER", id: uid(), imageId, x, y, area, now: nowIso() });
    },
    moveLabel(id, lx, ly) {
      dispatch({ type: "MOVE_LABEL", id, lx, ly });
    },
    removeDraft(id) {
      dispatch({ type: "REMOVE_DRAFT", id });
    },
    confirmDrafts(imageId) {
      dispatch({ type: "CONFIRM_DRAFTS", imageId, now: nowIso() });
    },
    renameLabel(id, name) {
      dispatch({ type: "RENAME_LABEL", id, name, now: nowIso() });
    },
    requestDelete(labels, image, reason, user) {
      const request = {
        id: uid(),
        imageId: image.id,
        imageName: image.name,
        labelIds: labels.map((l) => l.id),
        labels: labels.map((l) => ({ number: l.number, name: l.name })),
        requestedBy: user.name,
        requestedById: user.id,
        requestedAt: nowIso(),
        reason,
        status: "pending",
        reviewedBy: null,
        reviewedAt: null,
        reviewReason: null,
      };
      dispatch({ type: "REQUEST_DELETE", request });
    },
    reviewRequest(requestId, decision, reason, user) {
      dispatch({ type: "REVIEW_REQUEST", requestId, decision, reason, user, now: nowIso() });
    },
  };

  return (
    <DataContext.Provider value={{ data, actions, storageError }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
