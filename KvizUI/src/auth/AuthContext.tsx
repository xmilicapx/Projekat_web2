import React, { useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './useAuth';

export type AuthUser = {
  id: number | null;
  username: string;
  role: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => boolean;
  logout: () => void;
  getAuthHeader: () => Record<string, string>;
};

const AUTH_TOKEN_KEY = 'token';

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function extractRoleFromValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0];
  return null;
}

function decode(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<Record<string, unknown>>(token);

    const sub = decoded['sub'] ?? decoded['id'];
    const idNum = asString(sub) ? Number(asString(sub)) : null;

    const usernameCandidate =
      decoded['unique_name'] ?? decoded['uniqueName'] ?? decoded['username'] ?? decoded['name'];
    const username = asString(usernameCandidate);
    if (!username) return null;

    let roleCandidate: unknown = decoded['role'] ?? decoded['roles'] ?? decoded['Role'] ?? decoded['Roles'];

    if (roleCandidate === undefined) {
      const keys = Object.keys(decoded);
      const roleKey = keys.find((k) => k.toLowerCase().includes('/claims/role') || k.toLowerCase().endsWith('/role'));
      if (roleKey) roleCandidate = decoded[roleKey];
    }

    const role = extractRoleFromValue(roleCandidate);
    if (!role) return null;

    return {
      id: idNum,
      username,
      role: role.toLowerCase()
    };
  } catch {
    return null;
  }
}

function tokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<Record<string, unknown>>(token);
    const expRaw = decoded['exp'];
    if (expRaw === undefined) return true;

    const expNum = typeof expRaw === 'number' ? expRaw : Number(asString(expRaw));
    if (Number.isNaN(expNum)) return true;

    return expNum * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!raw) {
      setIsLoading(false);
      return;
    }

    if (tokenExpired(raw)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setIsLoading(false);
      return;
    }

    const u = decode(raw);
    if (!u) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setIsLoading(false);
      return;
    }

    setToken(raw);
    setUser(u);
    setIsLoading(false);
  }, []);

  const login = (newToken: string): boolean => {
    if (!newToken) return false;
    if (tokenExpired(newToken)) return false;

    const u = decode(newToken);
    if (!u) return false;

    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(u);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const getAuthHeader = (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      logout,
      getAuthHeader
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, isLoading]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}