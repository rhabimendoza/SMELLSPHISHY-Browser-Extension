from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

@app.route('/check_url', methods=['POST'])
def check_url():
    data = request.json
    url = data.get('url', '')
    
    if "123" in url:
        return jsonify({"result": 1})
    else:
        return jsonify({"result": 0})

if __name__ == '__main__':
    app.run(port=5000)