import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from .db import get_collection
from .recipes_fetcher import fetch_recipes, fetch_recipeofday
from .importer import import_remote_pages
from bson.objectid import ObjectId
from flask import send_from_directory
import os

app = Flask(__name__)
CORS(app)

recipes_col = get_collection('recipes')
flavors_col = get_collection('flavors')


@app.route('/seed', methods=['GET', 'POST'])
def seed():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    try:
        items = fetch_recipes(page=page, limit=limit)
    except Exception as e:
        return jsonify({'error': str(e)}), 502
    if not items:
        return jsonify({'inserted': 0})
    for it in items:
        recipes_col.update_one({'recipe_id': it.get('recipe_id')}, {'$set': it}, upsert=True)
        ings = it.get('ingredients', [])
        for ing in ings:
            other = [o for o in ings if o != ing]
            flavors_col.update_one(
                {'ingredient': ing},
                {'$setOnInsert': {'ingredient': ing}, '$addToSet': {'pairings': {'$each': other}}, '$set': {'attrs': it.get('flavors', {})}},
                upsert=True)
    return jsonify({'inserted': len(items)})


@app.route('/recipes')
def get_recipes():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
    except Exception:
        page, limit = 1, 10
    skip = (page - 1) * limit
    cursor = recipes_col.find().skip(skip).limit(limit)
    items = []
    for it in cursor:
        it['_id'] = str(it.get('_id') or '')
        items.append(it)
    return jsonify({'page': page, 'limit': limit, 'recipes': items})


@app.route('/recipeofday')
def recipe_of_day():
    try:
        remote = fetch_recipeofday()
    except Exception:
        item = recipes_col.find_one() or {}
        if item and '_id' in item:
            item['_id'] = str(item['_id'])
        return jsonify(item)
    recipes_col.update_one({'recipe_id': remote.get('recipe_id')}, {'$set': remote}, upsert=True)
    return jsonify(remote)


@app.route('/recipesbycuisine')
def recipes_by_cuisine():
    cuisine = request.args.get('cuisine')
    if not cuisine:
        return jsonify([])
    q = {'region': {'$regex': cuisine, '$options': 'i'}}
    items = []
    for it in recipes_col.find(q).limit(100):
        it['_id'] = str(it.get('_id'))
        items.append(it)
    return jsonify(items)


@app.route('/recipesbydiet')
def recipes_by_diet():
    diet = request.args.get('diet')
    if not diet:
        return jsonify([])
    q = {'diet': {'$regex': diet, '$options': 'i'}}
    items = []
    for it in recipes_col.find(q).limit(100):
        it['_id'] = str(it.get('_id'))
        items.append(it)
    return jsonify(items)


@app.route('/flavorpairings')
def flavor_pairings():
    ingredient = request.args.get('ingredient') or ''
    ing = ingredient.lower().strip()
    if not ing:
        return jsonify({'ingredient': '', 'pairings': []})
    doc = flavors_col.find_one({'ingredient': ing})
    if not doc:
        pipeline = [
            {'$match': {'ingredients': ing}},
            {'$unwind': '$ingredients'},
            {'$match': {'ingredients': {'$ne': ing}}},
            {'$group': {'_id': '$ingredients', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        res = list(recipes_col.aggregate(pipeline))
        return jsonify({'ingredient': ing, 'pairings': [r['_id'] for r in res]})
    pairings = doc.get('pairings', [])
    counts = {}
    for p in pairings:
        counts[p] = counts.get(p, 0) + 1
    sorted_pairs = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return jsonify({'ingredient': ing, 'pairings': [p for p, _ in sorted_pairs[:20]], 'attrs': doc.get('attrs', {})})


@app.route('/seed_demo')
def seed_demo():
    demo = [
        {
            'recipe_id': 'demo1',
            'title': 'Chickpea & Tahini Salad',
            'nutrition': {'calories': 280.0, 'protein': 10.5, 'fat': 18.0, 'carbs': 18.0},
            'region': 'Mediterranean',
            'diet': 'vegetarian',
            'utensils': ['bowl','knife'],
            'processes': ['mix','chop'],
            'ingredients': ['chickpeas','tahini','lemon','parsley','olive oil'],
            'flavors': {'savory': 7.5, 'bitter':1.2}
        },
        {
            'recipe_id': 'demo2',
            'title': 'Lentil Soup',
            'nutrition': {'calories': 210.0, 'protein': 12.0, 'fat': 4.0, 'carbs': 30.0},
            'region': 'Middle Eastern',
            'diet': 'vegan',
            'utensils': ['pot','ladle'],
            'processes': ['boil','simmer'],
            'ingredients': ['lentils','onion','carrot','cumin','garlic'],
            'flavors': {'savory':8.0,'spicy':2.0}
        },
        {
            'recipe_id': 'demo3',
            'title': 'Egyptian Falafel Wrap',
            'nutrition': {'calories': 420.0, 'protein': 15.0, 'fat': 20.0, 'carbs': 45.0},
            'region': 'Egyptian',
            'diet': 'vegetarian',
            'utensils': ['pan','spatula'],
            'processes': ['fry','assemble'],
            'ingredients': ['chickpeas','tahini','pita','tomato','lettuce'],
            'flavors': {'savory':8.5,'herbal':3.0}
        }
    ]
    for it in demo:
        recipes_col.update_one({'recipe_id': it['recipe_id']}, {'$set': it}, upsert=True)
        ings = it.get('ingredients', [])
        for ing in ings:
            other = [o for o in ings if o != ing]
            flavors_col.update_one({'ingredient': ing}, {'$setOnInsert': {'ingredient': ing}, '$addToSet': {'pairings': {'$each': other}}, '$set': {'attrs': it.get('flavors', {})}}, upsert=True)
    return jsonify({'inserted': len(demo)})


@app.route('/import_remote')
def import_remote():
    # query params: start, limit, max_pages, clear
    try:
        start = int(request.args.get('start', 1))
        limit = int(request.args.get('limit', 50))
        max_pages = int(request.args.get('max_pages', 20))
        clear = request.args.get('clear', 'false').lower() in ('1','true','yes')
    except Exception:
        return jsonify({'error': 'invalid params'}), 400
    n = import_remote_pages(start_page=start, limit=limit, max_pages=max_pages, clear_existing=clear)
    return jsonify({'imported': n, 'start': start, 'limit': limit, 'max_pages': max_pages})


@app.route('/')
def index():
    root = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(root, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    root = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(root, filename)


if __name__ == '__main__':
    # Use the Flask dev server for local demo
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8000)), debug=True)
