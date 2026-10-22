import { Link } from "react-router-dom";
import { Col, Card } from "react-bootstrap";

function Cards({ id, image, title, description, rating, price, ratingFunc }) {
  const detailsPath = `/menu/${id}`;

  return (
    <Col sm={6} lg={4} xl={3} className="mb-4">
      <Card className="overflow-hidden">
        <div className="overflow-hidden">
          <Link to={detailsPath} aria-label={`View details for ${title}`}>
            <Card.Img variant="top" src={image} alt={title} />
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
          <Card.Text>{description}</Card.Text>
          <div className="d-flex align-items-center justify-content-between">
            <div className="menu_price">
              <h5 className="mb-0">XAF {price}</h5>
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
