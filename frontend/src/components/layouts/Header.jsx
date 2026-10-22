/* eslint react/prop-types: "off" */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../cart/useCart";
import "../../styles/HeaderStyle.css";

function Header() {
  const [nav, setNav] = useState(false);
  const location = useLocation();
  const { status } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const changeValueOnScroll = () => {
      setNav(document.documentElement.scrollTop > 100);
    };
    changeValueOnScroll();
    window.addEventListener("scroll", changeValueOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", changeValueOnScroll);
  }, []);

  return (
    <header>
      <Navbar
        collapseOnSelect
        expand="lg"
        className={nav || location.pathname !== "/" ? "sticky" : ""}
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            className="logo"
            aria-label="Pasture Choice home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="logo_pasture">Pasture</span>
            <span className="logo_choice">Choice</span>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="responsive-navbar-nav"
            aria-label={`Toggle navigation, ${itemCount} items in cart`}
            className="mobile-menu-toggle"
          >
            <span className="mobile-menu-icon" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
            {itemCount > 0 && (
              <em className="mobile-cart-count" aria-hidden="true">
                {Number.isInteger(itemCount) ? itemCount : itemCount.toFixed(2)}
              </em>
            )}
          </Navbar.Toggle>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/#about">
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/#menu">
                Our Menu
              </Nav.Link>
              <Nav.Link as={Link} to="/products">
                Shop
              </Nav.Link>
              <Nav.Link as={Link} to="/#contact">
                Contact
              </Nav.Link>
              {status === "authenticated" && (
                <Nav.Link as={Link} to="/products/new">
                  Post Product
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/cart" aria-label={`Shopping cart, ${itemCount} items`}>
                <div className="cart">
                  <i className="bi bi-bag fs-5"></i>
                  {itemCount > 0 && (
                    <em className="roundpoint">
                      {Number.isInteger(itemCount) ? itemCount : itemCount.toFixed(2)}
                    </em>
                  )}
                </div>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
