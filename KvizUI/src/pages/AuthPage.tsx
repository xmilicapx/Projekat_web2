import React, { useEffect, useState } from "react";
import type { IUserApi } from "../api_services/interfaces/IUserApi";
import AuthLoginForm from "../components/auth_forms/AuthLoginForm";
import AuthRegisterForm from "../components/auth_forms/AuthRegisterForm";
import GradientBackground from "../components/layout/GradientBackground";
import { useAuth } from "../auth/useAuth";

type AuthPageProps = {
  userApi: IUserApi;
  onAuthSuccess?: () => void;
};

const AuthPage: React.FC<AuthPageProps> = ({ userApi, onAuthSuccess }) => {
  const { user } = useAuth();

  useEffect(() => {
    if(user)
      window.location.href = "/" + user.role;
  }, [user])

  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <GradientBackground>
      <div className="w-full max-w-3xl">
        <div className="bg-slate-100/60 backdrop-blur-xl border border-slate-300/8 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold">Welcome</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setTab("login")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tab === "login"
                    ? "bg-teal-600 text-white"
                    : "bg-white/10 text-teal-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab("register")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tab === "register"
                    ? "bg-teal-600 text-white"
                    : "bg-white/10 text-teal-700"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <div>
            {tab === "login" ? (
              <AuthLoginForm userApi={userApi} onSuccess={onAuthSuccess} />
            ) : (
              <AuthRegisterForm userApi={userApi} onSuccess={onAuthSuccess} />
            )}
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default AuthPage;
