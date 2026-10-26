import { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import Layout from "../../components/layouts/Layout";
import Cards from "../../components/cards/Cards";
import Rating from "../../utils/Rating";
import { fetchProducts } from "../../auth/authApi";
import productCategories from "../../data/productCategories";
import "../../styles/ProductsStyle.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((result) => {
        if (active) {
          setProducts(result.products);
          setStatus("success");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <main className="products_page">
        <Container>
          <section className="products-market-toolbar" aria-labelledby="products-title">
            <div className="products-market-intro">
              <p className="auth-eyebrow">Pasture Choice marketplace</p>
              <h1 id="products-title">Shop quality cuts</h1>
              <p>Browse quality meat, chicken, and turkey from local suppliers.</p>
            </div>
            <div className="products-market-filters">
              <label htmlFor="products-category-filter">Filter by category</label>
              <div className="products-filter-controls">
                <select
                  id="products-category-filter"
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setSelectedSubcategory("");
                  }}
                >
                  <option value="">All categories</option>
                  {Object.keys(productCategories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {selectedCategory &&
                  productCategories[selectedCategory].length > 0 && (
                    <select
                      aria-label="Filter by subcategory"
                      value={selectedSubcategory}
                      onChange={(event) =>
                        setSelectedSubcategory(event.target.value)
                      }
                    >
                      <option value="">All subcategories</option>
                      {productCategories[selectedCategory].map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                {(selectedCategory || selectedSubcategory) && (
                  <button
                    className="products-filter-reset"
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedSubcategory("");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {status === "loading" && (
            <p className="products_message" role="status">Loading products...</p>
          )}
          {status === "error" && (
            <p className="products_message auth-error" role="alert">{error}</p>
          )}
          {status === "success" && products.length === 0 && (
            <p className="products_message">No products have been posted yet.</p>
          )}

          {status === "success" &&
            products.length > 0 &&
            filteredProducts.length === 0 && (
              <p className="products_message">
                No products match this category yet.
              </p>
            )}

          {status === "success" && filteredProducts.length > 0 && (
            <Row className="product-card-grid">
              {filteredProducts.map((product) => (
                <Cards
                  key={product.id}
                  id={product.id}
                  detailsPath={`/products/${product.id}`}
                  image={product.images?.[0]?.url}
                  title={product.name}
                  description={product.description}
                  category={product.category}
                  rating={product.rating}
                  ratingFunc={Rating}
                  price={product.price}
                  priceLabel={`$${Number(product.price).toFixed(2)} / lb`}
                />
              ))}
            </Row>
          )}
        </Container>
      </main>
    </Layout>
  );
}

export default ProductsPage;
