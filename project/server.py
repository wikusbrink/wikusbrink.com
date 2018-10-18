# Run with
# export FLASK_APP=./server/server.py && flask run

from flask import Flask, render_template, jsonify, url_for

app = Flask(__name__, static_url_path='/static')

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/lifestyle')
def lifestyle():
    return render_template('lifestyle.html')