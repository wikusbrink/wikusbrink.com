from flask import Flask, request
import json
import os

app = Flask(__name__)

@app.route('/hook',methods=['POST'])
def update():
    data = json.loads(request.data)
    if data['ref'] == 'refs/heads/master':
        os.system('/home/ubuntu/wikusbrink.com/scripts/update.sh')
    return 'OK'

if __name__ == '__main__':
    app.run('0.0.0.0', 8080)
