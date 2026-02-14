from backend.db import get_collection
import json

def main():
    c = get_collection('recipes')
    docs = []
    for r in c.find().limit(20):
        r['_id'] = str(r.get('_id'))
        docs.append(r)
    print('count=', c.count_documents({}))
    print(json.dumps(docs, indent=2))

if __name__ == '__main__':
    main()
