import os
import requests
from typing import Dict, Any, List
from .utils import to_float, split_list_field, normalize_flavor_attrs

BASE = os.getenv("FOODOSCOPE_API_BASE", "http://cosylab.iiitd.edu.in:6969/recipe2-api/recipe")
API_TOKEN = os.getenv("FOODOSCOPE_API_TOKEN", "oiu953TOintm04XRvIbo7zme8NpLI3B3VCHxaoObc4MPLjj9")

HEADERS = {"Authorization": f"Bearer {API_TOKEN}", "Content-Type": "application/json"}

def fetch_recipes(page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
    url = f"{BASE}/recipesinfo?page={page}&limit={limit}"
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    data = r.json()
    # some APIs wrap data in 'docs' or 'data'
    docs = data.get("docs") if isinstance(data, dict) and "docs" in data else data
    if isinstance(docs, dict) and "data" in docs:
        docs = docs["data"]
    return [normalize_recipe(item) for item in (docs or [])]

def fetch_recipeofday() -> Dict[str, Any]:
    url = f"{BASE}/recipeofday"
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.raise_for_status()
    data = r.json()
    return normalize_recipe(data)

def normalize_recipe(item: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(item, dict):
        return {}
    rec = {}
    rec['recipe_id'] = item.get('recipe_id') or item.get('_id') or item.get('id')
    rec['title'] = item.get('title') or item.get('name')
    # nutrition may be nested
    nutrition = item.get('nutrition') or item.get('nutrients') or {}
    rec['nutrition'] = {
        'calories': to_float(nutrition.get('calories') or nutrition.get('energy') or nutrition.get('kcal')),
        'protein': to_float(nutrition.get('protein')),
        'fat': to_float(nutrition.get('fat')),
        'carbs': to_float(nutrition.get('carbohydrates') or nutrition.get('carbs')),
    }
    rec['region'] = item.get('region') or item.get('cuisine') or item.get('cuisineType')
    rec['diet'] = item.get('diet') or item.get('dietLabels')
    rec['utensils'] = split_list_field(item.get('utensils') or item.get('tools'))
    rec['processes'] = split_list_field(item.get('processes') or item.get('steps') or item.get('methods'))
    # ingredients
    ings = item.get('ingredients') or item.get('extendedIngredients') or []
    normalized_ings = []
    for ing in ings:
        if isinstance(ing, dict):
            name = ing.get('name') or ing.get('ingredient')
        else:
            name = str(ing)
        if name:
            normalized_ings.append(name.lower().strip())
    rec['ingredients'] = normalized_ings
    # flavor attributes
    flavors = item.get('flavors') or item.get('taste') or {}
    rec['flavors'] = normalize_flavor_attrs(flavors)
    return rec
