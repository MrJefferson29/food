import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { resetPassword } from "../../auth/authApi";
import "../../styles/AuthStyle.css";

function LogoutPage() {
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();
  const [showResetForm, setShowResetForm] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePasswordReset(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const result = await resetPassword({ email, password });
      setMessage(result.message);
      setPassword("");
      setShowResetForm(false);
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut();
        setError("Your session expired. Sign in again to reset your password.");
        return;
      }
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  if (status === "loading") {
    return (
      <main className="auth-page">
        <p className="auth-status" role="status">Checking your session...</p>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="logout-title">
        <Link className="auth-brand" to="/" aria-label="Pasture Choice home">
          Pasture Choice
        </Link>
        <p className="auth-eyebrow">Account settings</p>
        <h1 id="logout-title">Password &amp; logout</h1>
        {user ? (
          <>
            <p className="auth-description">Signed in as {user.email}</p>
            {message && <p className="auth-success" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}

            {showResetForm && (
              <form onSubmit={handlePasswordReset}>
                <label htmlFor="reset-email">Account email</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <label htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <span className="auth-hint">Use 8 to 72 characters.</span>
                <button className="auth-submit" type="submit" disabled={submitting}>
                  {submitting ? "Updating password..." : "Save new password"}
                </button>
              </form>
            )}

            <div className="logout-actions">
              <button
                className="auth-secondary"
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setEmail(user.email);
                  setShowResetForm((current) => !current);
                }}
              >
                {showResetForm ? "Cancel password reset" : "Reset password"}
              </button>
              <button className="auth-submit" type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="auth-description">
              Sign in to reset your password or log out of your account.
            </p>
            <Link className="auth-submit auth-modal-link" to="/login">
              Go to login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default LogoutPage;
