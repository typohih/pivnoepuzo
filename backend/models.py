from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, default="")
    description = Column(String, nullable=False)
    rating = Column(Float, nullable = False)
    rarity = Column(String(50), nullable=False)
    design = Column(String, nullable=False)
    design_rate = Column(Float, nullable=False)
    taste = Column(String, nullable=False)
    taste_rate = Column(Float, nullable=False)
    aftertaste = Column(String, nullable=False)
    aftertaste_rate = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    image = Column(String(500), nullable=False)
