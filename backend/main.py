import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from .db import get_collection
from .recipes_fetcher import fetch_recipes, fetch_recipeofday, normalize_recipe
from .models import Recipe
from typing import List

app = FastAPI(title="Foodoscope API")

recipes_col = get_collection('recipes')
flavors_col = get_collection('flavors')

@app.on_event('startup')
def ensure_indexes_and_seed():
    # create simple indexes
    recipes_col.create_index('recipe_id', unique=False)
    flavors_col.create_index('ingredient', unique=True)

@app.post('/seed')
def seed(page: int = 1, limit: int = 20):
    try:
        items = fetch_recipes(page=page, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    if not items:
        return {"inserted": 0}
    ops = []
    for it in items:
        recipes_col.update_one({'recipe_id': it.get('recipe_id')}, {'$set': it}, upsert=True)
        # update flavors collection: for each ingredient, add pairings
        ings = it.get('ingredients', [])
        for ing in ings:
            other = [o for o in ings if o != ing]
            flavors_col.update_one(
                {'ingredient': ing},
                {'$setOnInsert': {'ingredient': ing}, '$addToSet': {'pairings': {'$each': other}}, '$set': {'attrs': it.get('flavors', {})}},
                upsert=True)
    return {"inserted": len(items)}

@app.get('/recipes')
def get_recipes(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100)):
    skip = (page - 1) * limit
    cursor = recipes_col.find().skip(skip).limit(limit)
    items = list(cursor)
    for it in items:
        it['_id'] = str(it.get('_id'))
    return JSONResponse(content={"page": page, "limit": limit, "recipes": items})

@app.get('/recipeofday')
def recipe_of_day():
    try:
        remote = fetch_recipeofday()
    except Exception:
        # fallback to random from DB
        item = recipes_col.find_one() or {}
        return item
    # upsert and return
    recipes_col.update_one({'recipe_id': remote.get('recipe_id')}, {'$set': remote}, upsert=True)
    return remote

@app.get('/recipesbycuisine')
def recipes_by_cuisine(cuisine: str = Query(...)):
    q = {'region': {'$regex': cuisine, '$options': 'i'}}
    items = list(recipes_col.find(q).limit(100))
    for it in items:
        it['_id'] = str(it.get('_id'))
    return items

@app.get('/recipesbydiet')
def recipes_by_diet(diet: str = Query(...)):
    q = {'diet': {'$regex': diet, '$options': 'i'}}
    items = list(recipes_col.find(q).limit(100))
    for it in items:
        it['_id'] = str(it.get('_id'))
    return items

@app.get('/flavorpairings')
def flavor_pairings(ingredient: str):
    ing = ingredient.lower().strip()
    doc = flavors_col.find_one({'ingredient': ing})
    if not doc:
        # try simple co-occurrence search
        pipeline = [
            {'$match': {'ingredients': ing}},
            {'$unwind': '$ingredients'},
            {'$match': {'ingredients': {'$ne': ing}}},
            {'$group': {'_id': '$ingredients', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        res = list(recipes_col.aggregate(pipeline))
        return {'ingredient': ing, 'pairings': [r['_id'] for r in res]}
    # sort by frequency
    pairings = doc.get('pairings', [])
    # crude frequency count
    counts = {}
    for p in pairings:
        counts[p] = counts.get(p, 0) + 1
    sorted_pairs = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return {'ingredient': ing, 'pairings': [p for p, _ in sorted_pairs[:20]], 'attrs': doc.get('attrs', {})}
