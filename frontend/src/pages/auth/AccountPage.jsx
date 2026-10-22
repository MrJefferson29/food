import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import "../../styles/AuthStyle.css";

function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPostPrompt, setShowPostPrompt] = useState(
    Boolean(location.state?.showPostPrompt)
  );
  const [createdProduct, setCreatedProduct] = useState("");

  useEffect(() => {
    if (location.state?.showPostPrompt) {
      setShowPostPrompt(true);
    }
    if (location.state?.productCreated) {
      setCreatedProduct(location.state.productName || "Your product");
    }
    if (location.state) {
      navigate(".", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="account-title">
        <Link className="auth-brand" to="/" aria-label="Meat Market home">
          Meat Market
        </Link>
        <p className="auth-eyebrow">Authenticated account</p>
        <h1 id="account-title">You’re signed in</h1>
        <p className="auth-description">{user?.email}</p>
        {createdProduct && (
          <p className="auth-success" role="status">
            {createdProduct} was posted successfully.
          </p>
        )}
        <Link className="auth-submit auth-modal-link" to="/">
          Go home
        </Link>
      </section>
      <Modal
        show={showPostPrompt}
        onHide={() => setShowPostPrompt(false)}
        centered
        aria-labelledby="post-product-prompt-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="post-product-prompt-title">
            Ready to list a product?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your account is ready. Add a product so local restaurants can find
          what you offer.
        </Modal.Body>
        <Modal.Footer>
          <button
            className="auth-secondary"
            type="button"
            onClick={() => setShowPostPrompt(false)}
          >
            Maybe later
          </button>
          <Link className="auth-submit auth-modal-link" to="/products/new">
            Post a product
          </Link>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

export default AccountPage;
