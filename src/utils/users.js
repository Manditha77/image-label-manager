// Users (no backend yet). "approver" = admin who approves / rejects delete requests.
export const USERS = [
  { id: "u1", username: "user", password: "user123", name: "User", role: "user" },
  { id: "a1", username: "admin", password: "admin123", name: "Admin", role: "approver" },
];

export function findUser(username, password) {
  return USERS.find(
    (u) => u.username === username.trim().toLowerCase() && u.password === password,
  );
}

export function getUserById(id) {
  return USERS.find((u) => u.id === id) || null;
}
