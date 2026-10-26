/* eslint react/prop-types: "off" */
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { formatCurrency } from "./checkout";

const QUANTITY_STEP = 0.25;

function AddToCartModal({ item, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) setQuantity(1);
  }, [item]);

  const validQuantity = Number.isFinite(quantity) && quantity >= QUANTITY_STEP;
  const subtotal = item && validQuantity ? item.price * quantity : 0;

  function updateQuantity(value) {
    const nextQuantity = Number(value);
    setQuantity(Number.isFinite(nextQuantity) ? nextQuantity : 0);
  }

  return (
    <Modal show={Boolean(item)} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Choose the amount</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {item && (
          <>
            <p className="mb-3">{item.title}</p>
            <label className="form-label" htmlFor="cart-pound-quantity">
              Quantity in pounds
            </label>
            <div className="d-flex align-items-center gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                aria-label="Decrease pounds"
                disabled={!validQuantity || quantity <= QUANTITY_STEP}
                onClick={() =>
                  updateQuantity(
                    Math.max(QUANTITY_STEP, quantity - QUANTITY_STEP).toFixed(2)
                  )
                }
              >
                −
              </Button>
              <input
                id="cart-pound-quantity"
                className="form-control text-center"
                type="number"
                min={QUANTITY_STEP}
                step={QUANTITY_STEP}
                value={quantity || ""}
                onChange={(event) => updateQuantity(event.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="outline-secondary"
                aria-label="Increase pounds"
                onClick={() =>
                  updateQuantity((quantity + QUANTITY_STEP).toFixed(2))
                }
              >
                +
              </Button>
            </div>
            <p className="mt-3 mb-0">
              Price: {formatCurrency(item?.price || 0)} / lb
            </p>
            <p className="mt-2 mb-0 fw-bold" aria-live="polite">
              Subtotal: {formatCurrency(subtotal)}
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          className="btn_red"
          disabled={!validQuantity}
          onClick={() => onConfirm(quantity)}
        >
          Add to Cart
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddToCartModal;
