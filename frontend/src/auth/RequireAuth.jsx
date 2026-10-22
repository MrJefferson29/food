import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

function RequireAuth() {
  const { status, verifySession } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(false);

  if (status === "loading" || checking) {
    return (
      <main className="auth-page">
        <p className="auth-status" role="status">Checking your session...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="session-error-title">
          <h1 id="session-error-title">Unable to verify your session</h1>
          <p>Check your connection and try again.</p>
          <button
            className="auth-submit"
            type="button"
            onClick={async () => {
              setChecking(true);
              await verifySession();
              setChecking(false);
            }}
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
