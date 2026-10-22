import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import Layout from "../../components/layouts/Layout";
import { useCart } from "../../cart/useCart";
import { createOrderEmail, formatCurrency } from "../../cart/checkout";
import "../../styles/CartStyle.css";

function CartPage() {
  const { items, subtotal, setQuantity, removeItem, clearCart } = useCart();
  const [showClearPrompt, setShowClearPrompt] = useState(false);
  const checkoutPending = useRef(false);
  const checkoutWindowBlurred = useRef(false);

  useEffect(() => {
    function handleWindowBlur() {
      if (checkoutPending.current) {
        checkoutWindowBlurred.current = true;
      }
    }

    function handleWindowFocus() {
      if (checkoutPending.current && checkoutWindowBlurred.current) {
        checkoutPending.current = false;
        setShowClearPrompt(true);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        handleWindowBlur();
      } else {
        handleWindowFocus();
      }
    }

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function checkout() {
    if (items.length === 0) return;
    const order = createOrderEmail(items, subtotal);
    checkoutWindowBlurred.current = false;
    checkoutPending.current = true;
    const checkoutWindow = window.open(order.url, "_blank");
    if (!checkoutWindow) {
      checkoutPending.current = false;
      setShowClearPrompt(false);
      window.alert("Allow pop-ups for this site to open your Gmail order.");
      return;
    }
    checkoutWindow.opener = null;
  }

  function handleClearCart() {
    clearCart();
    setShowClearPrompt(false);
  }

  return (
    <Layout>
      <main className="cart_page">
        <Container>
          <Row>
            <Col lg={{ span: 8, offset: 2 }} className="cart_heading">
              <p className="cart_eyebrow">Meat Market | Order desk</p>
              <h1>Your cart</h1>
              <p>Review your selection before sending your order request.</p>
            </Col>
          </Row>

          {items.length === 0 ? (
            <section className="cart_empty">
              <i className="bi bi-basket3" aria-hidden="true"></i>
              <h2>Your cart is waiting</h2>
              <p>Explore the marketplace and add products or menu items.</p>
              <Link className="cart_primary_button" to="/products">
                Browse products
              </Link>
            </section>
          ) : (
            <div className="cart_layout">
              <section className="cart_items" aria-label="Cart items">
                {items.map((item) => (
                  <article className="cart_item" key={item.key}>
                    {item.image ? (
                      <img className="cart_item_image" src={item.image} alt="" />
                    ) : (
                      <div className="cart_item_image cart_item_image_empty">
                        <i className="bi bi-image" aria-hidden="true"></i>
                      </div>
                    )}
                    <div className="cart_item_details">
                      <h2>{item.title}</h2>
                      <p>
                        {formatCurrency(item.price)}
                        {item.unit === "lb" ? " / lb" : " each"}
                      </p>
                      <div className="cart_quantity" aria-label={`Quantity of ${item.title}`}>
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.title}`}
                          onClick={() =>
                            setQuantity(
                              item.key,
                              item.quantity - (item.unit === "lb" ? 0.25 : 1)
                            )
                          }
                        >
                          <i className="bi bi-dash" aria-hidden="true"></i>
                        </button>
                        <input
                          type="number"
                          min={item.unit === "lb" ? "0.25" : "1"}
                          step={item.unit === "lb" ? "0.25" : "1"}
                          value={item.quantity}
                          aria-label={`Quantity of ${item.title}`}
                          onChange={(event) => {
                            if (event.target.value !== "") {
                              const quantity = Number(event.target.value);
                              setQuantity(item.key, quantity);
                            }
                          }}
                        />
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.title}`}
                          onClick={() =>
                            setQuantity(
                              item.key,
                              item.quantity + (item.unit === "lb" ? 0.25 : 1)
                            )
                          }
                        >
                          <i className="bi bi-plus" aria-hidden="true"></i>
                        </button>
                        <span>{item.unit === "lb" ? "lb" : "qty"}</span>
                      </div>
                    </div>
                    <div className="cart_item_total">
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                      <button
                        className="cart_remove_button"
                        type="button"
                        onClick={() => removeItem(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="cart_summary">
                <p className="cart_eyebrow">Order summary</p>
                <h2>Ready when you are</h2>
                <div className="cart_summary_row">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="cart_summary_row cart_total">
                  <span>Estimated total</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <p className="cart_checkout_note">
                  Your order request opens in Gmail, ready to send to our team.
                </p>
                <button
                  className="cart_primary_button cart_checkout_button"
                  type="button"
                  onClick={checkout}
                >
                  <i className="bi bi-envelope me-2" aria-hidden="true"></i>
                  Continue to checkout
                </button>
                <Link className="cart_continue_link" to="/products">
                  Continue shopping
                </Link>
                <section className="order_email_preview" aria-label="Order email preview">
                  <div className="order_email_brand">
                    <span className="order_email_mark">M</span>
                    <div>
                      <strong>MEAT MARKET</strong>
                      <span>LOCAL SUPPLY. EXCEPTIONAL QUALITY.</span>
                    </div>
                  </div>
                  <p className="order_email_kicker">ORDER REQUEST</p>
                  <h3>Order summary</h3>
                  <div className="order_email_rows">
                    {items.map((item) => (
                      <div className="order_email_line" key={item.key}>
                        <div>
                          <strong>{item.title}</strong>
                          <span>
                            {item.unit === "lb"
                              ? `${item.quantity.toFixed(2)} lb`
                              : `${item.quantity} ${item.quantity === 1 ? "item" : "items"}`}
                            {" x "}
                            {formatCurrency(item.price)}
                            {item.unit === "lb" ? " / lb" : ""}
                          </span>
                        </div>
                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="order_email_total">
                    <span>ESTIMATED TOTAL</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <p className="order_email_footer">
                    Please confirm availability and next steps for completing
                    this order.
                  </p>
                </section>
              </aside>
            </div>
          )}
        </Container>
      </main>
      <Modal
        show={showClearPrompt}
        onHide={() => setShowClearPrompt(false)}
        centered
        aria-labelledby="clear-cart-prompt-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="clear-cart-prompt-title">
            Have you sent your order?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your order is open in Gmail. Would you like to clear these items from
          your cart?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="cart_secondary_button"
            type="button"
            onClick={() => setShowClearPrompt(false)}
          >
            Keep my cart
          </button>
          <button
            className="cart_primary_button"
            type="button"
            onClick={handleClearCart}
          >
            Yes, clear my cart
          </button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default CartPage;
