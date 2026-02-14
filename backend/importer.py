import os
from typing import List
from dotenv import load_dotenv
from .recipes_fetcher import fetch_recipes, normalize_recipe
from .db import get_collection

load_dotenv()

recipes_col = get_collection('recipes')
flavors_col = get_collection('flavors')

def import_remote_pages(start_page: int = 1, limit: int = 50, max_pages: int = 50, clear_existing: bool = False):
    """Fetch pages from the remote API and upsert into MongoDB.

    Returns number of recipes inserted/updated.
    """
    if clear_existing:
        recipes_col.delete_many({})
        flavors_col.delete_many({})

    page = start_page
    total = 0
    while page < start_page + max_pages:
        items = fetch_recipes(page=page, limit=limit)
        if not items:
            break
        for it in items:
            # ensure normalized
            rec = normalize_recipe(it) if not isinstance(it, dict) else it
            recipes_col.update_one({'recipe_id': rec.get('recipe_id')}, {'$set': rec}, upsert=True)
            ings = rec.get('ingredients', [])
            for ing in ings:
                other = [o for o in ings if o != ing]
                flavors_col.update_one({'ingredient': ing}, {'$setOnInsert': {'ingredient': ing}, '$addToSet': {'pairings': {'$each': other}}, '$set': {'attrs': rec.get('flavors', {})}}, upsert=True)
        total += len(items)
        page += 1
    return total

if __name__ == '__main__':
    # quick CLI runner
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=int, default=1)
    parser.add_argument('--limit', type=int, default=50)
    parser.add_argument('--max-pages', type=int, default=20)
    parser.add_argument('--clear', action='store_true')
    args = parser.parse_args()
    n = import_remote_pages(start_page=args.start, limit=args.limit, max_pages=args.max_pages, clear_existing=args.clear)
    print('Imported', n, 'recipes')
