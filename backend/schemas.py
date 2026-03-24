from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    author: str
    description: str
    rating: float
    rarity: str
    design: str
    design_rate: float
    taste: str
    taste_rate: float
    aftertaste: str
    aftertaste_rate: float
    percentage: float
    price: float
    image: str

class ProductResponse(BaseModel):
    id: int
    name: str
    author: str
    description: str
    rating: float
    rarity: str
    design: str
    design_rate: float
    taste: str
    taste_rate: float
    aftertaste: str
    aftertaste_rate: float
    percentage: float
    price: float
    image: str

class ProductUpdate(BaseModel):
    name: str | None = None
    author: str | None = None
    description: str | None = None
    rating: float | None = None
    rarity: str | None = None
    design: str | None = None
    design_rate: float | None = None
    taste: str | None = None
    taste_rate: float | None = None
    aftertaste: str | None = None
    aftertaste_rate: float | None = None
    percentage: float | None = None
    price: float | None = None
    image: str | None = None

    class Config:
        from_attributes = True
