from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Nutrition(BaseModel):
    calories: Optional[float]
    protein: Optional[float]
    fat: Optional[float]
    carbs: Optional[float]

class Recipe(BaseModel):
    recipe_id: Optional[str]
    title: Optional[str]
    nutrition: Nutrition
    region: Optional[str]
    diet: Optional[Any]
    utensils: List[str] = Field(default_factory=list)
    processes: List[str] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)
    flavors: Dict[str, float] = Field(default_factory=dict)
