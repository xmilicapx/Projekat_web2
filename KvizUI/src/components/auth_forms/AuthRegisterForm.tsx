import React, { useState } from "react";
import type { UserDto } from "../../models/user";
import type { IUserApi } from "../../api_services/interfaces/IUserApi";
import { fileToDataUrl } from "../../utils/ImageCompress";

type Props = {
  userApi: IUserApi;
  onSuccess?: () => void;
};

const AuthRegisterForm: React.FC<Props> = ({ userApi, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    const valid = ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
    if (!valid) {
      setError("Only PNG or JPG allowed");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file, 512, 0.8);
      setImageDataUrl(dataUrl);
    } catch {
      setError("Failed to process image");
    }
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    const user: UserDto = {
      id: 0,
      username,
      password,
      email,
      role,
      image: imageDataUrl,
    };
    try {
      const token = await userApi.registerUser(user);
      if (token) {
        onSuccess?.();
        localStorage.setItem("token", token);
      } else {
        setError("Registration failed");
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
            className="w-full rounded-md px-3 py-2 border outline-none border-slate-500 bg-white/5"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Profile image</label>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="border outline-none border-slate-500 px-2 rounded-lg"
          />
          {imageDataUrl && (
            <img
              src={imageDataUrl}
              alt="preview"
              className="w-20 h-20 object-cover rounded-md border"
            />
          )}
        </div>
      </div>

      {error && <div className="text-teal-800 text-sm">{error}</div>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white font-medium disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </form>
  );
};

export default AuthRegisterForm;
