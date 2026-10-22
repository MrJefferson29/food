import { Link, useParams } from "react-router-dom";
import { Col, Container, Row, Button } from "react-bootstrap";
import Layout from "../../components/layouts/Layout";
import burgerData from "../../data/burgerData";
import Rating from "../../utils/Rating";
import "../../styles/MenuItemStyle.css";
import { useCart } from "../../cart/useCart";
import { useLayoutEffect, useState } from "react";

function ItemDetails() {
  const { id } = useParams();
  const item = burgerData.find((menuItem) => menuItem.id === id);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    addItem({
      key: `menu:${item.id}`,
      id: item.id,
      type: "menu",
      title: item.title,
      description: item.description,
      image: item.image,
      price: Number(item.price.replaceAll(",", "")),
      unit: "each",
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Layout>
      <main className="menu_item_page">
        <Container>
          <Link to="/#menu" className="menu_item_back">
            <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
            Back to menu
          </Link>

          {item ? (
            <Row className="menu_item_layout mt-4">
              <Col md={6} className="menu_item_media">
                <div className="menu_item_image_frame">
                  <img
                    className="menu_item_image img-fluid"
                    src={item.image}
                    alt={item.title}
                  />
                </div>
              </Col>
              <Col md={6} className="menu_item_content">
                <span className="menu_item_eyebrow">Pasture Choice selection</span>
                <div className="menu_item_rating_row">
                  <div
                    className="menu_item_rating"
                    aria-label={`Rated ${item.rating} out of 5`}
                  >
                    <Rating rating={item.rating} />
                  </div>
                  <span className="menu_item_rating_value">{item.rating.toFixed(1)} / 5</span>
                </div>

                <h1>{item.title}</h1>
                <h2 className="menu_item_section_label">About this cut</h2>
                <p className="menu_item_description">{item.description}</p>

                <div className="menu_item_purchase">
                  <div className="menu_item_price">
                    <span className="menu_item_price_label">Price</span>
                    <strong>
                      ${Number(item.price.replaceAll(",", "")).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                    <span className="menu_item_price_unit">/ lb</span>
                  </div>
                  <Button
                  className="btn btn_red detail_primary_button"
                  onClick={handleAddToCart}
                >
                  {added ? "Added to Cart" : "Add to Cart"}
                </Button>
                </div>
                <p className="menu_item_note">
                  <i className="bi bi-box-seam" aria-hidden="true"></i>
                  Quality meat selected for your kitchen
                </p>
              </Col>
            </Row>
          ) : (
            <section className="menu_item_not_found">
              <h1>Menu item not found</h1>
              <p>This item may no longer be available.</p>
              <Link to="/#menu" className="btn btn_red rounded-0">
                Browse the menu
              </Link>
            </section>
          )}
        </Container>
      </main>
    </Layout>
  );
}

export default ItemDetails;