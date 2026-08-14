import os
import yaml
from flask import Flask, abort, jsonify, request

app = Flask(__name__)

@app.route("/run")
def run():
    return os.system("tar xzf " + request.args.get("file"))

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        abort(400)
    return jsonify(data)
