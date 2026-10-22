/* eslint react/prop-types: "off" */
import { Link } from "react-router-dom";
import { Col, Card } from "react-bootstrap";
import "../../styles/CardsStyle.css";

function Cards({
  id,
  image,
  title,
  description,
  category,
  rating,
  price,
  priceLabel,
  detailsPath = `/menu/${id}`,
  ratingFunc,
}) {
  return (
    <Col sm={6} lg={4} xl={3} className="mb-4">
      <Card className="overflow-hidden">
        <div className="overflow-hidden">
          <Link to={detailsPath} aria-label={`View details for ${title}`}>
            {image ? (
              <Card.Img variant="top" src={image} alt={title} />
            ) : (
              <div className="product-card-placeholder" aria-label="No product image">
                <i className="bi bi-image" aria-hidden="true"></i>
                <span>No image</span>
              </div>
            )}
          </Link>
        </div>
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <div className="item_rating">
              {ratingFunc && ratingFunc({ rating })}
            </div>
            <div className="wishlist">
              <i className="bi bi-heart"></i>
            </div>
          </div>
          <Link to={detailsPath} className="menu_item_link">
            <Card.Title>{title}</Card.Title>
          </Link>
          {category && (
            <div className="product-card-categories">
              <span>{category}</span>
            </div>
          )}
          <Card.Text>{description}</Card.Text>
          <div className="d-flex align-items-center justify-content-between">
            <div className="menu_price">
              <h5 className="mb-0">
                {priceLabel ||
                  `$${Number(String(price).replaceAll(",", "")).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h5>
            </div>
            <div className="add_to_card">
              <Link to={detailsPath}>
                View Details
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default Cards;
