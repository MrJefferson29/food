import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import Layout from "../../components/layouts/Layout";
import ImageFilePicker from "../../components/products/ImageFilePicker";
import Rating from "../../utils/Rating";
import { useAuth } from "../../auth/useAuth";
import productCategories from "../../data/productCategories";
import {
  deleteProduct,
  fetchProduct,
  updateProduct,
} from "../../auth/authApi";
import "../../styles/MenuItemStyle.css";
import "../../styles/ProductsStyle.css";
import { useCart } from "../../cart/useCart";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [images, setImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetchProduct(id)
      .then((result) => {
        if (!active) return;
        setProduct(result.product);
        setActiveImage(0);
        setStatus("success");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setStatus(requestError.status === 404 ? "not-found" : "error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  function beginEditing() {
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description);
    setCategory(product.category || "");
    setSubcategory(product.subcategory || "");
    setImages([]);
    setRemovedImageIds([]);
    setError("");
    setIsEditing(true);
  }

  function handleImageSelection(selected) {
    const retainedCount =
      (product.images?.length || 0) -
      removedImageIds.length +
      selected.length;
    if (retainedCount > MAX_IMAGES) {
      setError("Remove existing photos or select fewer than 3 images total.");
      return;
    }
    if (selected.some((image) => !ACCEPTED_IMAGE_TYPES.includes(image.type))) {
      setError("Images must be JPEG, PNG, or WebP files.");
      return;
    }
    if (selected.some((image) => image.size > MAX_IMAGE_SIZE)) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }
    setImages(selected);
    setError("");
  }

  function removeSelectedImage(index) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
    setError("");
  }

  function toggleImageRemoval(publicId) {
    setRemovedImageIds((current) =>
      current.includes(publicId)
        ? current.filter((idValue) => idValue !== publicId)
        : [...current, publicId]
    );
    setError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("description", description.trim());
    formData.append("category", category);
    if (subcategory) formData.append("subcategory", subcategory);
    formData.append("removeImageIds", JSON.stringify(removedImageIds));
    images.forEach((image) => formData.append("images", image));

    try {
      const result = await updateProduct(id, formData);
      setProduct(result.product);
      setIsEditing(false);
      if (result.warning) setError(result.warning);
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    setError("");
    try {
      await deleteProduct(id);
      navigate("/products", {
        replace: true,
        state: { deletedProduct: product.name },
      });
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      setError(requestError.message);
    }
  }

  function handleAddToCart() {
    addItem({
      key: `product:${product.id}`,
      id: product.id,
      type: "product",
      title: product.name,
      description: product.description,
      image: product.images?.[0]?.url || "",
      price: Number(product.price),
      unit: "lb",
      quantity: 1,
    });
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1800);
  }

  const isOwner = product && user?.id === product.ownerId;

  return (
    <Layout>
      <main className="menu_item_page">
        <Container>
          <Link to="/products" className="menu_item_back">
            <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
            Back to products
          </Link>

          {status === "loading" && (
            <p className="products_message" role="status">Loading product...</p>
          )}
          {(status === "error" || status === "not-found") && (
            <section className="menu_item_not_found">
              <h1>{status === "not-found" ? "Product not found" : "Unable to load product"}</h1>
              <p>{error}</p>
              <Link to="/products" className="btn btn_red rounded-0">
                Browse products
              </Link>
            </section>
          )}

          {status === "success" && product && (
            <Row className="menu_item_layout mt-4">
              <Col md={6} className="menu_item_media">
                {product.images?.length > 0 ? (
                  <div className="product-detail-gallery">
                    <div className="menu_item_image_frame">
                      <img
                        className="menu_item_image img-fluid"
                        src={product.images[activeImage]?.url || product.images[0].url}
                        alt={product.name}
                      />
                    </div>
                    {product.images.length > 1 && (
                      <div
                        className="product-detail-thumbnails"
                        aria-label="Product images"
                      >
                        {product.images.map((image, index) => (
                          <button
                            key={image.publicId}
                            type="button"
                            className={
                              index === activeImage
                                ? "product-detail-thumbnail active"
                                : "product-detail-thumbnail"
                            }
                            onClick={() => setActiveImage(index)}
                            aria-label={`Show image ${index + 1} of ${product.images.length}`}
                            aria-pressed={index === activeImage}
                          >
                            <img src={image.url} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="product-detail-empty-image menu_item_image">
                    <i className="bi bi-image" aria-hidden="true"></i>
                    <span>No product images</span>
                  </div>
                )}
              </Col>
              <Col md={6} className="menu_item_content">
                <span className="menu_item_eyebrow">Pasture Choice marketplace</span>
                <div className="menu_item_rating_row">
                  <div
                    className="menu_item_rating"
                    aria-label={`Rated ${product.rating} out of 5`}
                  >
                    <Rating rating={product.rating} />
                  </div>
                  <span className="menu_item_rating_value">
                    {Number(product.rating || 0).toFixed(1)} / 5
                  </span>
                </div>

                {isEditing ? (
                  <form className="product-edit-form" onSubmit={handleSave}>
                    <label htmlFor="edit-product-name">Product name</label>
                    <input
                      id="edit-product-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={120}
                      required
                    />
                    <label htmlFor="edit-product-price">Price (USD per pound)</label>
                    <input
                      id="edit-product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      required
                    />
                    <label htmlFor="edit-product-category">Main category</label>
                    <select
                      id="edit-product-category"
                      value={category}
                      onChange={(event) => {
                        setCategory(event.target.value);
                        setSubcategory("");
                      }}
                      required
                    >
                      <option value="" disabled>
                        Select a main category
                      </option>
                      {Object.keys(productCategories).map((mainCategory) => (
                        <option key={mainCategory} value={mainCategory}>
                          {mainCategory}
                        </option>
                      ))}
                    </select>
                    {category && productCategories[category]?.length > 0 && (
                      <>
                        <label htmlFor="edit-product-subcategory">Subcategory</label>
                        <select
                          id="edit-product-subcategory"
                          value={subcategory}
                          onChange={(event) => setSubcategory(event.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select a subcategory
                          </option>
                          {productCategories[category].map((subCategory) => (
                            <option key={subCategory} value={subCategory}>
                              {subCategory}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    <label htmlFor="edit-product-description">Description</label>
                    <textarea
                      id="edit-product-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      maxLength={5000}
                      rows={5}
                      required
                    />
                    {product.images?.length > 0 && (
                      <fieldset className="product-edit-images">
                        <legend>Remove existing images</legend>
                        {product.images.map((image, index) => (
                          <label key={image.publicId}>
                            <input
                              type="checkbox"
                              checked={removedImageIds.includes(image.publicId)}
                              onChange={() => toggleImageRemoval(image.publicId)}
                            />
                            Remove image {index + 1}
                          </label>
                        ))}
                      </fieldset>
                    )}
                    <ImageFilePicker
                      id="edit-product-images"
                      files={images}
                      onFilesChange={handleImageSelection}
                      onRemoveFile={removeSelectedImage}
                    />
                    {error && <p className="auth-error" role="alert">{error}</p>}
                    <div className="product-action-row">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1>{product.name}</h1>
                    {product.category && (
                      <div className="product-category-badges">
                        <span>{product.category}</span>
                        {product.subcategory && <span>{product.subcategory}</span>}
                      </div>
                    )}
                    <h2 className="menu_item_section_label">Product details</h2>
                    <p className="menu_item_description">{product.description}</p>
                    <div className="menu_item_purchase">
                      <div className="menu_item_price">
                        <span className="menu_item_price_label">Price</span>
                        <strong>${Number(product.price).toFixed(2)}</strong>
                        <span className="menu_item_price_unit">/ lb</span>
                      </div>
                      <Button
                        className="btn btn_red detail_primary_button"
                        onClick={handleAddToCart}
                        type="button"
                      >
                        {addedToCart ? "Added to Cart" : "Add to Cart"}
                      </Button>
                    </div>
                    {error && <p className="auth-error" role="alert">{error}</p>}
                    {isOwner && (
                      <div className="product-action-row">
                        <Button type="button" onClick={beginEditing}>
                          Edit product
                        </Button>
                        <Button type="button" variant="danger" onClick={handleDelete}>
                          Delete product
                        </Button>
                      </div>
                    )}
                    <p className="menu_item_note">
                      <i className="bi bi-box-seam" aria-hidden="true"></i>
                      Quality meat for your kitchen
                    </p>
                  </>
                )}
              </Col>
            </Row>
          )}
        </Container>
      </main>
    </Layout>
  );
}

export default ProductDetailsPage;
