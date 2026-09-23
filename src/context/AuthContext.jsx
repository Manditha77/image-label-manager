import { createContext, useContext, useState } from "react";
import { findUser, getUserById } from "../utils/users";

const AuthContext = createContext(null);
const SESSION_KEY = "ilm-session";

// sessionStorage (not localStorage) = each browser tab has its own login.
// So you can be logged in as "user" in one tab and "admin" in another tab.
function loadSession() {
  try {
    const id = sessionStorage.getItem(SESSION_KEY);
    return id ? getUserById(id) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);

  function login(username, password) {
    const found = findUser(username, password);
    if (!found) return false;
    sessionStorage.setItem(SESSION_KEY, found.id);
    setUser(found);
    return true;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
