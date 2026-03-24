import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from database import Base, engine
import models
from routes.products import router as products_router


def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS")

    if raw_origins:
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    return [
        "https://pivnoepuzo.vercel.app",
        "https://www.pivnoepuzo.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


app = FastAPI()

os.makedirs("uploads", exist_ok=True)

Base.metadata.create_all(bind=engine)


def ensure_product_author_column() -> None:
    inspector = inspect(engine)

    if "products" not in inspector.get_table_names():
        return

    column_names = {column["name"] for column in inspector.get_columns("products")}

    if "author" in column_names:
        return

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE products ADD COLUMN author VARCHAR(255) NOT NULL DEFAULT ''")
        )


ensure_product_author_column()

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(products_router)


@app.get("/")
def root():
    return {"message": "API is running"}
