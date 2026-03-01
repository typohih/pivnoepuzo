import cors from "cors";
import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(rootDir, "uploads");
const catalogFile = path.join(dataDir, "catalog.json");
const port = Number(process.env.PORT) || 3001;
const editorPassword = process.env.CATALOG_EDITOR_PASSWORD || "12utfg*po2c";
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ADDITIONAL_CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim()),
  "http://localhost:5173",
].filter(Boolean);

const mimeToExtension = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function parseRatingValue(value) {
  const text = String(value ?? "").trim().replace(",", ".");

  if (!text) {
    return 0;
  }

  if (text.includes("/")) {
    const [left, right] = text.split("/").map((part) => Number(part.trim()));

    if (Number.isFinite(left) && Number.isFinite(right) && right > 0) {
      return Math.max(0, Math.min(5, (left / right) * 5));
    }
  }

  return Math.max(0, Math.min(5, Number(text) || 0));
}

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  try {
    await fs.access(catalogFile);
  } catch {
    await fs.writeFile(catalogFile, "[]\n", "utf8");
  }
}

async function readCatalog() {
  await ensureStorage();

  try {
    const raw = await fs.readFile(catalogFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCatalog(products) {
  await ensureStorage();
  await fs.writeFile(catalogFile, `${JSON.stringify(products, null, 2)}\n`, "utf8");
}

function requireEditorPassword(request, response, next) {
  const providedPassword = request.get("x-catalog-password");

  if (providedPassword !== editorPassword) {
    response.status(401).json({ error: "Invalid password" });
    return;
  }

  next();
}

async function saveImageFromDataUrl(dataUrl) {
  if (!dataUrl) {
    return "";
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Unsupported image payload");
  }

  const [, mimeType, base64Payload] = match;
  const extension = mimeToExtension[mimeType];

  if (!extension) {
    throw new Error("Unsupported image type");
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filepath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(base64Payload, "base64");

  await fs.writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

function normalizeProduct(body, imageUrl) {
  const toText = (value) => String(value ?? "").trim();
  const ratingLabel = toText(body.rating);
  const ratingNumber = parseRatingValue(body.rating);

  return {
    id: `product-${Date.now()}-${crypto.randomUUID()}`,
    name: toText(body.name),
    price: toText(body.price),
    rating: ratingNumber.toFixed(1),
    ratingLabel: ratingLabel || ratingNumber.toFixed(1),
    rarity: toText(body.rarity),
    design: toText(body.design),
    taste: toText(body.taste),
    aftertaste: toText(body.aftertaste),
    alcoholPercent: toText(body.alcoholPercent),
    description: toText(body.description),
    imageUrl,
    createdAt: new Date().toISOString(),
  };
}

export function createApp() {
  const app = express();
  app.use(cors({
  origin(origin, callback) {
    // запросы без Origin (например, из браузера напрямую, health-checks) — разрешаем
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.options("/*", cors());
  app.use(express.json({ limit: "10mb" }));
  app.use("/uploads", express.static(uploadsDir));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      time: new Date().toISOString(),
    });
  });

  app.get("/api/products", async (_request, response) => {
    const catalog = await readCatalog();
    response.json(catalog);
  });

  app.post("/api/auth", express.json(), (request, response) => {
    if (request.body?.password !== editorPassword) {
      response.status(401).json({ error: "Invalid password" });
      return;
    }

    response.status(204).end();
  });

  app.post("/api/products", requireEditorPassword, async (request, response) => {
    try {
      const imageUrl = await saveImageFromDataUrl(request.body?.imageDataUrl);
      const product = normalizeProduct(request.body ?? {}, imageUrl);

      const requiredValues = [
        product.name,
        product.price,
        product.rarity,
        product.design,
        product.taste,
        product.aftertaste,
        product.alcoholPercent,
        product.description,
        product.imageUrl,
      ];

      if (requiredValues.some((value) => !value)) {
        response.status(400).json({ error: "Missing required product fields" });
        return;
      }

      const catalog = await readCatalog();
      catalog.unshift(product);
      await writeCatalog(catalog);

      response.status(201).json(product);
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  });

  return app;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  const app = createApp();
  ensureStorage()
    .then(() => {
      app.listen(port, () => {
        console.log(`Catalog server listening on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start catalog server", error);
      process.exit(1);
    });
}
