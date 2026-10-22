/* eslint react/prop-types: "off" */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AuthContext from "./AuthContext";
import { authenticate, fetchCurrentUser } from "./authApi";

const TOKEN_KEY = "meat-market-token";

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const verificationId = useRef(0);

  const clearSession = useCallback(() => {
    verificationId.current += 1;
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const verifySession = useCallback(async () => {
    const currentVerificationId = ++verificationId.current;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return false;
    }

    setStatus("loading");
    try {
      const result = await fetchCurrentUser(token);
      if (currentVerificationId !== verificationId.current) {
        return false;
      }
      setUser(result.user);
      setStatus("authenticated");
      return true;
    } catch (error) {
      if (currentVerificationId !== verificationId.current) {
        return false;
      }
      if (error.status === 401) {
        clearSession();
      } else {
        setStatus("error");
      }
      return false;
    }
  }, [clearSession]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const signIn = useCallback(async (mode, credentials) => {
    const result = await authenticate(mode, credentials);
    verificationId.current += 1;
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      signIn,
      signOut: clearSession,
      verifySession,
    }),
    [status, user, signIn, clearSession, verifySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
