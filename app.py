import os
import yaml
import pickle
from flask import Flask, request

app = Flask(__name__)

@app.route("/run")
def run():
    return os.system("tar xzf " + request.args.get("file"))

@app.route("/load")
def load():
    return yaml.safe_load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
