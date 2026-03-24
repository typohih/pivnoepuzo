import os
import secrets
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, status
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductResponse, ProductUpdate


router = APIRouter(prefix="/products", tags=["products"])
DEFAULT_ADMIN_TOKEN = "7edi8uy3yas"


def verify_admin_token(x_admin_token: str | None = Header(default=None)) -> None:
    admin_token = os.getenv("ADMIN_TOKEN", DEFAULT_ADMIN_TOKEN)

    if not admin_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_TOKEN is not configured",
        )

    if x_admin_token is None or not secrets.compare_digest(x_admin_token, admin_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token",
        )


@router.get("", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.post("", response_model=ProductResponse)
def create_product(
    name: str = Form(...),
    author: str = Form(...),
    description: str = Form(...),
    rating: float = Form(...),
    rarity: str = Form(...),
    design: str = Form(...),
    design_rate: float = Form(...),
    taste: str = Form(...),
    taste_rate: float = Form(...),
    aftertaste: str = Form(...),
    aftertaste_rate: float = Form(...),
    percentage: float = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    os.makedirs("uploads", exist_ok=True)

    file_extension = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join("uploads", unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save file")
    finally:
        image.file.close()

    image_db_path = f"/uploads/{unique_filename}"

    new_product = Product(
        name=name,
        author=author,
        description=description,
        rating=rating,
        rarity=rarity,
        design=design,
        design_rate=design_rate,
        taste=taste,
        taste_rate=taste_rate,
        aftertaste=aftertaste,
        aftertaste_rate=aftertaste_rate,
        percentage=percentage,
        price=price,
        image=image_db_path
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    name: str | None = Form(None),
    author: str | None = Form(None),
    description: str | None = Form(None),
    rating: float | None = Form(None),
    rarity: str | None = Form(None),
    design: str | None = Form(None),
    design_rate: float | None = Form(None),
    taste: str | None = Form(None),
    taste_rate: float | None = Form(None),
    aftertaste: str | None = Form(None),
    aftertaste_rate: float | None = Form(None),
    percentage: float | None = Form(None),
    price: float | None = Form(None),
    image: UploadFile | None = File(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = ProductUpdate(
        name=name,
        author=author,
        description=description,
        rating=rating,
        rarity=rarity,
        design=design,
        design_rate=design_rate,
        taste=taste,
        taste_rate=taste_rate,
        aftertaste=aftertaste,
        aftertaste_rate=aftertaste_rate,
        percentage=percentage,
        price=price,
    ).model_dump(exclude_none=True)

    if not updates and image is None:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    for field_name, field_value in updates.items():
        setattr(product, field_name, field_value)

    if image is not None and image.filename:
        os.makedirs("uploads", exist_ok=True)

        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join("uploads", unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to save file")
        finally:
            image.file.close()

        old_image_path = product.image
        product.image = f"/uploads/{unique_filename}"

        if old_image_path:
            old_file_name = old_image_path.replace("/uploads/", "")
            old_file_path = os.path.join("uploads", old_file_name)

            if os.path.exists(old_file_path):
                os.remove(old_file_path)

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    image_path = product.image

    if image_path:
        file_name = image_path.replace("/uploads/", "")
        file_path = os.path.join("uploads", file_name)

        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}
