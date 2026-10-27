# Backend API

## Setup

1. From this directory, copy `.env.example` to `.env` and provide your MongoDB URI, a random JWT secret (at least 32 characters), and Cloudinary credentials.
2. Install dependencies with `npm install`.
3. Start the API with `npm run dev` for development or `npm start` for production.

The API listens on port `5000` by default. Set `PORT` to change it. If `CORS_ORIGINS` is empty, cross-origin requests are allowed; otherwise, it must be a comma-separated list of allowed origins.

## Authentication

Passwords must be 8–72 bytes. Registration and login return a signed JWT. Send it on protected endpoints as `Authorization: Bearer <token>`.

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `PUT` | `/api/auth/password` | Authenticated |

Both authentication endpoints accept JSON with `email` and `password`. Email addresses are normalized to lowercase.
The current-user endpoint verifies the bearer token and confirms the user account still exists.
The password update endpoint accepts JSON with `email` and `password`. It requires a valid bearer token and only updates the password when the supplied email matches the signed-in account.

## Products

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/products` | Public |
| `GET` | `/api/products/:id` | Public |
| `POST` | `/api/products` | Authenticated |
| `PATCH` | `/api/products/:id` | Authenticated product owner |
| `DELETE` | `/api/products/:id` | Authenticated product owner |

Create products using `multipart/form-data` fields `name`, `price`, `description`, and `category`, plus up to three `images` files. Supported main categories are `Ground Meats`, `Beef Special Cuts`, `Pork Cuts`, `Goat Cuts`, `Chicken`, `Turkey`, `Fresh Seafood`, and `Prepared Seafood & Sushi`. Include a subcategory when applicable: beef, pork, and goat cuts use `Steaks & Premium Cuts`, `Ribs & Roasts`, or `Offal & Specialty Cuts`; chicken uses `Whole Chicken`, `Breasts & Tenders`, `Thighs & Drumsticks`, `Wings`, or `Ground Chicken`; turkey uses `Whole Turkey`, `Breasts & Tenderloins`, `Thighs & Drumsticks`, or `Ground Turkey`; fresh seafood uses `Fresh Finfish` or `Shellfish & Crustaceans`; prepared seafood uses `Sushi & Sashimi`. Ground Meats has no subcategory. The price is a non-negative number in dollars per pound. Images can be JPEG, PNG, or WebP, up to 5 MB each.

Product updates accept `multipart/form-data` or JSON. Include only the fields to change. Category changes require a valid subcategory when the selected main category has subcategories. New `images` are appended to the current images; `removeImageIds` can be supplied as a JSON array of Cloudinary public IDs (or a JSON-encoded array in multipart form data) to remove existing images. The resulting product may have at most three images.

Product responses include the image URLs and Cloudinary public IDs. Authentication responses include `{ "user": { "id", "email" }, "token" }`. Errors use a JSON `{ "message": "..." }` response.
Each new product receives a server-generated rating from 3 to 5 in half-star increments. Ratings are read-only and are returned with product responses.
