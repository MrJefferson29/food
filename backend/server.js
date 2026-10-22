require("dotenv").config();

const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const { Readable } = require("node:stream");

const app = express();
const port = Number(process.env.PORT) || 5000;
const jwtSecret = process.env.JWT_SECRET;
const imageFolder = process.env.CLOUDINARY_FOLDER || "local-meat-products";
const productCategories = {
  "Ground Meats": [],
  "Beef Special Cuts": [
    "Steaks & Premium Cuts",
    "Ribs & Roasts",
    "Offal & Specialty Cuts",
  ],
  "Pork Cuts": [
    "Steaks & Premium Cuts",
    "Ribs & Roasts",
    "Offal & Specialty Cuts",
  ],
  "Goat Cuts": [
    "Steaks & Premium Cuts",
    "Ribs & Roasts",
    "Offal & Specialty Cuts",
  ],
  "Fresh Seafood": ["Fresh Finfish", "Shellfish & Crustaceans"],
  "Prepared Seafood & Sushi": ["Sushi & Sashimi"],
};
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: Object.keys(productCategories),
    },
    subcategory: {
      type: String,
      enum: Object.values(productCategories).flat(),
    },
    rating: {
      type: Number,
      required: true,
      min: 3,
      max: 5,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      default: [],
      validate: {
        validator: (images) => images.length <= 3,
        message: "A product can have at most 3 images",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

function generateProductRating() {
  return 3 + Math.floor(Math.random() * 5) / 2;
}

async function ensureProductRating(product) {
  if (
    Number.isFinite(product.rating) &&
    product.rating >= 3 &&
    product.rating <= 5
  ) {
    return product;
  }

  await Product.updateOne(
    { _id: product._id, rating: { $exists: false } },
    { $set: { rating: generateProductRating() } }
  );
  const updatedProduct = await Product.findById(product._id);
  if (!updatedProduct) {
    throw httpError(404, "Product not found");
  }
  return updatedProduct;
}

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(httpError(403, "Origin is not allowed by CORS"));
          }
        : "*",
  })
);
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (request, response) =>
    response
      .status(429)
      .json({ message: "Too many authentication attempts; try again later" }),
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 3,
    fields: 20,
    parts: 23,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (request, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(httpError(400, "Images must be JPEG, PNG, or WebP files"));
    }
    return callback(null, true);
  },
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateCredentials(email, password) {
  if (typeof email !== "string" || !email.trim()) {
    throw httpError(400, "A valid email address is required");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw httpError(400, "A valid email address is required");
  }
  if (
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw httpError(400, "Password must be between 8 and 72 bytes");
  }
  return normalizedEmail;
}

function createToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function requireAuth(request, response, next) {
  const authorization = request.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(httpError(401, "Authentication token is required"));
  }

  try {
    const payload = jwt.verify(match[1], jwtSecret);
    if (
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      return next(httpError(401, "Invalid or expired authentication token"));
    }
    request.userId = payload.sub;
    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return next(httpError(401, "Invalid or expired authentication token"));
    }
    return next(error);
  }
}

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: imageFolder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary returned no upload result"));
        }
        return resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(file.buffer).pipe(upload);
  });
}

async function uploadImages(files) {
  const uploaded = [];
  try {
    for (const file of files) {
      uploaded.push(await uploadToCloudinary(file));
    }
    return uploaded;
  } catch (error) {
    const failures = await deleteCloudinaryImages(uploaded);
    if (failures.length) {
      console.error("Failed to clean up partially uploaded images:", failures);
    }
    throw error;
  }
}

async function deleteCloudinaryImages(images) {
  const results = await Promise.allSettled(
    images.map((image) =>
      cloudinary.uploader.destroy(image.publicId, { resource_type: "image" })
    )
  );
  return results
    .map((result, index) =>
      result.status === "rejected"
        ? { publicId: images[index].publicId, error: result.reason }
        : result.value?.result === "ok" || result.value?.result === "not found"
          ? null
          : { publicId: images[index].publicId, error: result.value }
    )
    .filter(Boolean);
}

function parseRemoveImageIds(value) {
  if (value === undefined) {
    return [];
  }
  let ids = value;
  if (typeof ids === "string") {
    try {
      ids = JSON.parse(ids);
    } catch {
      throw httpError(400, "removeImageIds must be a JSON array of image IDs");
    }
  }
  if (
    !Array.isArray(ids) ||
    ids.some((id) => typeof id !== "string" || !id.trim())
  ) {
    throw httpError(400, "removeImageIds must be a JSON array of image IDs");
  }
  return [...new Set(ids)];
}

function validateProductInput(body, partial = false, currentCategory = "") {
  body = body && typeof body === "object" ? body : {};
  const values = {};
  for (const field of ["name", "description"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        throw httpError(400, `${field} must be a non-empty string`);
      }
      const value = body[field].trim();
      const maxLength = field === "name" ? 120 : 5000;
      if (value.length > maxLength) {
        throw httpError(400, `${field} must be at most ${maxLength} characters`);
      }
      values[field] = value;
    } else if (!partial) {
      throw httpError(400, `${field} is required`);
    }
  }

  if (body.price !== undefined) {
    const price =
      typeof body.price === "number" ? body.price : Number(body.price);
    if (!Number.isFinite(price) || price < 0 || body.price === "") {
      throw httpError(400, "price must be a non-negative number in dollars per pound");
    }
    values.price = price;
  } else if (!partial) {
    throw httpError(400, "price is required");
  }

  if (body.category !== undefined) {
    if (
      typeof body.category !== "string" ||
      !Object.prototype.hasOwnProperty.call(productCategories, body.category)
    ) {
      throw httpError(400, "category must be a valid product category");
    }
    values.category = body.category;
  } else if (!partial) {
    throw httpError(400, "category is required");
  }

  const category = values.category || currentCategory;
  if (
    body.category !== undefined &&
    body.subcategory === undefined &&
    productCategories[category]?.length > 0
  ) {
    throw httpError(400, "subcategory is required for the selected category");
  }
  if (body.subcategory !== undefined) {
    if (
      typeof body.subcategory !== "string" ||
      !productCategories[category]?.includes(body.subcategory)
    ) {
      throw httpError(400, "subcategory must be valid for the selected category");
    }
    values.subcategory = body.subcategory;
  } else if (!partial && productCategories[category]?.length > 0) {
    throw httpError(400, "subcategory is required for the selected category");
  } else if (
    values.category &&
    productCategories[category]?.length === 0
  ) {
    values.subcategory = undefined;
  }

  return values;
}

function serializeProduct(product) {
  const value = product.toObject ? product.toObject() : product;
  return {
    id: String(value._id),
    name: value.name,
    price: value.price,
    rating: value.rating,
    description: value.description,
    category: value.category,
    subcategory: value.subcategory || "",
    images: value.images || [],
    ownerId: String(value.owner),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

app.post("/api/auth/register", authLimiter, async (request, response, next) => {
  try {
    const email = validateCredentials(
      request.body?.email,
      request.body?.password
    );
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      throw httpError(409, "An account with this email already exists");
    }
    const password = await bcrypt.hash(request.body.password, 12);
    const user = await User.create({ email, password });
    return response.status(201).json({
      user: { id: user.id, email: user.email },
      token: createToken(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(httpError(409, "An account with this email already exists"));
    }
    return next(error);
  }
});

app.post("/api/auth/login", authLimiter, async (request, response, next) => {
  try {
    const email = validateCredentials(
      request.body?.email,
      request.body?.password
    );
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(request.body.password, user.password))) {
      throw httpError(401, "Email or password is incorrect");
    }
    return response.json({
      user: { id: user.id, email: user.email },
      token: createToken(user),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.userId).select("_id email").lean();
    if (!user) {
      throw httpError(401, "Authentication token is no longer valid");
    }
    return response.json({
      user: { id: String(user._id), email: user.email },
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/products", async (request, response, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    await Promise.all(products.map(ensureProductRating));
    return response.json({ products: products.map(serializeProduct) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/products/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      throw httpError(400, "Invalid product ID");
    }
    const foundProduct = await Product.findById(request.params.id);
    if (!foundProduct) {
      throw httpError(404, "Product not found");
    }
    const product = await ensureProductRating(foundProduct);
    return response.json({ product: serializeProduct(product) });
  } catch (error) {
    return next(error);
  }
});

app.post(
  "/api/products",
  requireAuth,
  imageUpload.array("images", 3),
  async (request, response, next) => {
    let images = [];
    try {
      const values = validateProductInput(request.body);
      images = await uploadImages(request.files || []);
      const product = await Product.create({
        ...values,
        rating: generateProductRating(),
        images,
        owner: request.userId,
      });
      return response.status(201).json({ product: serializeProduct(product) });
    } catch (error) {
      if (images.length) {
        const failures = await deleteCloudinaryImages(images);
        if (failures.length) {
          console.error("Failed to clean up uploaded product images:", failures);
        }
      }
      return next(error);
    }
  }
);

app.patch(
  "/api/products/:id",
  requireAuth,
  imageUpload.array("images", 3),
  async (request, response, next) => {
    let newlyUploaded = [];
    try {
      if (!mongoose.isValidObjectId(request.params.id)) {
        throw httpError(400, "Invalid product ID");
      }
      const product = await Product.findById(request.params.id);
      if (!product) {
        throw httpError(404, "Product not found");
      }
      if (String(product.owner) !== request.userId) {
        throw httpError(403, "You can only edit your own products");
      }

      const body = request.body || {};
      const values = validateProductInput(body, true, product.category);
      const removeImageIds = parseRemoveImageIds(body.removeImageIds);
      const currentIds = new Set(product.images.map((image) => image.publicId));
      if (removeImageIds.some((id) => !currentIds.has(id))) {
        throw httpError(400, "One or more image IDs do not belong to this product");
      }
      const retainedImages = product.images.filter(
        (image) => !removeImageIds.includes(image.publicId)
      );
      const files = request.files || [];
      if (
        Object.keys(values).length === 0 &&
        files.length === 0 &&
        removeImageIds.length === 0
      ) {
        throw httpError(400, "Provide at least one product field or image change");
      }
      if (retainedImages.length + files.length > 3) {
        throw httpError(400, "A product can have at most 3 images");
      }

      newlyUploaded = await uploadImages(files);
      Object.assign(product, values);
      product.images = [...retainedImages, ...newlyUploaded];
      await product.save();

      const imagesToDelete = [
        ...removeImageIds.map((publicId) => ({ publicId })),
      ];
      const cleanupFailures = await deleteCloudinaryImages(imagesToDelete);
      if (cleanupFailures.length) {
        console.error("Failed to remove replaced product images:", cleanupFailures);
        return response.json({
          product: serializeProduct(product),
          warning:
            "Product updated, but one or more removed images could not be deleted from Cloudinary",
        });
      }
      return response.json({ product: serializeProduct(product) });
    } catch (error) {
      if (newlyUploaded.length) {
        const failures = await deleteCloudinaryImages(newlyUploaded);
        if (failures.length) {
          console.error("Failed to clean up uploaded product images:", failures);
        }
      }
      return next(error);
    }
  }
);

app.delete(
  "/api/products/:id",
  requireAuth,
  async (request, response, next) => {
    try {
      if (!mongoose.isValidObjectId(request.params.id)) {
        throw httpError(400, "Invalid product ID");
      }
      const product = await Product.findById(request.params.id);
      if (!product) {
        throw httpError(404, "Product not found");
      }
      if (String(product.owner) !== request.userId) {
        throw httpError(403, "You can only delete your own products");
      }
      await product.deleteOne();
      const cleanupFailures = await deleteCloudinaryImages(product.images);
      if (cleanupFailures.length) {
        console.error("Failed to remove deleted product images:", cleanupFailures);
        return response.json({
          message: "Product deleted, but one or more images could not be deleted from Cloudinary",
        });
      }
      return response.json({ message: "Product deleted" });
    } catch (error) {
      return next(error);
    }
  }
);

app.use((request, response, next) => {
  next(httpError(404, "Route not found"));
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }
  if (error instanceof multer.MulterError) {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return response.status(status).json({ message: error.message });
  }
  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }
  return response
    .status(status)
    .json({
      message:
        status >= 500
          ? "An unexpected server error occurred"
          : error.message,
    });
});

async function startServer() {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start backend API:", error);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };