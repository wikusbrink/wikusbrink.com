# Run with
# export FLASK_APP=./server.py && flask run

from flask import Flask, render_template, jsonify, url_for, Response, request
import json
import pymongo

app = Flask(__name__, static_url_path='/static')


class db():   
    def __init__(self, collection, key):
        client = pymongo.MongoClient('mongodb://mongodb:27017/')
        db = client['siteContent']
        self._collection = db[collection]
        self._key = key
        
    def upsert(self, document):
        collection_filter = {}
        collection_filter[self._key] = document[self._key]
        self._collection.replace_one(collection_filter, document, upsert=True)

    def get(self, value):
        query = {}
        query[self._key] = value
        data = self._collection.find_one(query)
        del data['_id']
        return data
        
    def list_all(self):
        cursor = self._collection.find({})
        documents = []
        for doc in cursor:
            del doc['_id']
            documents.append(doc)
        return documents

    def clear(self):
        self._collection.drop()

site_data = db('siteData', 'date')

@app.route('/api/lifestyle', methods = ['GET'])
@app.route('/api/lifestyle/', methods = ['GET'])
def lifestyleObjectAll():
    data = site_data.list_all()
    js = json.dumps(data)
    resp = Response(js, status=200, mimetype='application/json')
    return resp

@app.route('/api/lifestyle', methods = ['DELETE'])
@app.route('/api/lifestyle/', methods = ['DELETE'])
def lifestyleObjectClear():
    site_data.clear()
    resp = Response(status=200)
    return resp

@app.route('/api/lifestyle/<date>', methods = ['GET', 'PUT'])
def lifestyleObject(date):
    if request.method == 'GET':
        data = site_data.get(date)
        js = json.dumps(data)
        resp = Response(js, status=200, mimetype='application/json')
        return resp
    if request.method == 'PUT':
        data = request.json
        site_data.upsert(data)
        resp = Response(status=200)
        return resp

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/lifestyle')
def lifestyle():
    return render_template('lifestyle.html')

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
