const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/+$/,
  ""
);

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Could not connect to the server. Please try again.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return body;
}

export function authenticate(mode, credentials) {
  return request(`/api/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function fetchCurrentUser(token) {
  return request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createProduct(formData) {
  const token = localStorage.getItem("meat-market-token");
  if (!token) {
    const error = new Error("Please sign in to post a product.");
    error.status = 401;
    return Promise.reject(error);
  }

  return request("/api/products", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

function authenticatedRequest(path, options = {}) {
  const token = localStorage.getItem("meat-market-token");
  if (!token) {
    const error = new Error("Please sign in to continue.");
    error.status = 401;
    return Promise.reject(error);
  }
  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchProducts() {
  return request("/api/products");
}

export function fetchProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}`);
}

export function updateProduct(id, formData) {
  return authenticatedRequest(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteProduct(id) {
  return authenticatedRequest(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
