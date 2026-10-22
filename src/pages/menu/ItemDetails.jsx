import { Link, useParams } from "react-router-dom";
import { Col, Container, Row, Button } from "react-bootstrap";
import Layout from "../../components/layouts/Layout";
import burgerData from "../../data/burgerData";
import Rating from "../../utils/Rating";
import "../../styles/MenuItemStyle.css";

function ItemDetails() {
  const { id } = useParams();
  const item = burgerData.find((menuItem) => menuItem.id === id);

  const handleAddToCart = () => {
    // Add your cart/order logic here
    console.log(`Added ${item?.title} to cart`);
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
            <Row className="align-items-center mt-4">
              <Col md={6}>
                <img
                  className="menu_item_image img-fluid"
                  src={item.image}
                  alt={item.title}
                />
              </Col>
              <Col md={6} className="menu_item_content">
                <div
                  className="menu_item_rating"
                  aria-label={`Rated ${item.rating} out of 5`}
                >
                  <Rating rating={item.rating} />
                </div>
                
                <h1>{item.title}</h1>
                
                <h2>Description</h2>
                <p className="menu_item_description">{item.description}</p>
                
                <p className="menu_item_price mb-4">XAF {item.price}</p>

                <Button 
                  className="btn btn_red rounded-0 w-100 py-3 text-uppercase fw-bold border-0"
                  onClick={handleAddToCart}
                >
                  Add to Order
                </Button>
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