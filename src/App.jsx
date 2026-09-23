import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Workspace from "./pages/Workspace";

export default function App() {
  const { user } = useAuth();
  return user ? <Workspace key={user.id} /> : <LoginPage />;
}
