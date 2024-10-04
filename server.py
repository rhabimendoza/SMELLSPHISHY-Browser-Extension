from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from smellsphishy_converter import *

# Create flask app
app = Flask(__name__)
CORS(app) 

# Add a default page, created only to remove error
@app.route("/") 
def index():
	return render_template("index.html")

# Create a route for checking
@app.route('/check_url', methods=['POST'])
def check_url():

    # Get the url
    data = request.json
    url = data.get('url', '')

    # Check url format
    if(checkURLFormat(url) == 2):
        return jsonify({"result": 2})

    # Send the url to function for checking
    result = checkURLInput(url)
    classification = result[0]

    # Return classification
    if classification == 1:
        return jsonify({"result": 1})
    else:
        return jsonify({"result": 0})

# Run app
if __name__ == '__main__':
    app.run(port=5000)