import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function Logout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 justify-end">
      <span className="text-sm text-white">Logged in as <strong>{user.username}</strong></span>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition duration-200"
      >
        Log Out
      </button>
    </div>
  );
}
