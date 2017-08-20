from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/hook',methods=['POST'])
def foo():
   data = json.loads(request.data)
   print data
   return "OK"

if __name__ == '__main__':
   app.run('0.0.0.0', 8080)

