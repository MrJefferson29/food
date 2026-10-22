import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../auth/authApi";
import { useAuth } from "../../auth/useAuth";
import ImageFilePicker from "../../components/products/ImageFilePicker";
import productCategories from "../../data/productCategories";
import "../../styles/AuthStyle.css";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function NewProductPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleImagesChange(selection) {
    if (selection.length > MAX_IMAGES) {
      setError("Choose up to 3 images.");
      return;
    }
    const invalidType = selection.find(
      (image) => !ACCEPTED_IMAGE_TYPES.includes(image.type)
    );
    if (invalidType) {
      setError("Images must be JPEG, PNG, or WebP files.");
      return;
    }
    const tooLarge = selection.find((image) => image.size > MAX_IMAGE_SIZE);
    if (tooLarge) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setImages(selection);
  }

  function removeSelectedImage(index) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("description", description.trim());
    formData.append("category", category);
    if (subcategory) formData.append("subcategory", subcategory);
    images.forEach((image) => formData.append("images", image));

    try {
      const result = await createProduct(formData);
      navigate("/account", {
        replace: true,
        state: {
          productCreated: true,
          productName: result.product.name,
        },
      });
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page product-page">
      <section className="auth-card product-card" aria-labelledby="product-title">
        <Link className="auth-brand" to="/" aria-label="Meat Market home">
          Meat Market
        </Link>
        <p className="auth-eyebrow">For local restaurants</p>
        <h1 id="product-title">Post a product</h1>
        <p className="auth-description">
          Share product details and up to three photos with nearby buyers.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="product-name">Product name</label>
          <input
            id="product-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
          />

          <label htmlFor="product-price">Price (USD per pound)</label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />

          <label htmlFor="product-category">Main category</label>
          <select
            id="product-category"
            name="category"
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

          {category && productCategories[category].length > 0 && (
            <>
              <label htmlFor="product-subcategory">Subcategory</label>
              <select
                id="product-subcategory"
                name="subcategory"
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

          <label htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={5000}
            rows={5}
            required
          />

          <ImageFilePicker
            id="product-images"
            files={images}
            onFilesChange={handleImagesChange}
            onRemoveFile={removeSelectedImage}
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Posting product..." : "Post product"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default NewProductPage;
