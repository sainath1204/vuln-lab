import os
import subprocess
from pathlib import Path
import yaml
import pickle
from flask import Flask, request

app = Flask(__name__)
ARCHIVE_DIR = Path(os.environ.get("ARCHIVE_DIR", "/tmp/archives")).resolve()

@app.route("/run")
def run():
    filename = request.args.get("file")
    if not filename:
        return "Missing file", 400

    archive_path = (ARCHIVE_DIR / filename).resolve()
    try:
        archive_path.relative_to(ARCHIVE_DIR)
    except ValueError:
        return "Invalid file", 400

    if not archive_path.is_file():
        return "File not found", 404

    subprocess.run(["tar", "xzf", str(archive_path)], check=True, shell=False)
    return "", 204

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
