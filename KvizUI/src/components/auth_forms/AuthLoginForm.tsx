import React, { useState } from "react";
import type { LoginDto } from "../../models/login";
import type { IUserApi } from "../../api_services/interfaces/IUserApi";

type Props = {
  userApi: IUserApi;
  onSuccess?: () => void;
};

const AuthLoginForm: React.FC<Props> = ({ userApi, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    const payload: LoginDto = { username, password };
    try {
      const token = await userApi.authenticateUser(payload);
      if (token) {
        onSuccess?.();
        localStorage.setItem("token", token);
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md px-3 py-2 border outline-none border-slate-500 bg-white/5"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md px-3 py-2 border outline-none border-slate-500 bg-white/5"
          required
        />
      </div>

      {error && <div className="text-teal-800 text-sm">{error}</div>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white font-medium disabled:opacity-60"
        >
          {loading ? "Logging..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default AuthLoginForm;
