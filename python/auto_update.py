from flask import Flask, request
import json
import os

app = Flask(__name__)

@app.route('/hook',methods=['POST'])
def update():
    data = json.loads(request.data)
    if data['ref'] == 'refs/heads/master':
    	try:
        	os.system('service wikusbrink.com stop')
        except:
        	pass
        os.system('cd /home/ubuntu/wikusbrink.com && git pull')
        os.system('cd /home/ubuntu/wikusbrink.com/src && npm install')
        os.system('cd /home/ubuntu/wikusbrink.com/src && bower install')
        os.system('service wikusbrink.com start')

    return "OK"

if __name__ == '__main__':
    app.run('0.0.0.0', 8080)
