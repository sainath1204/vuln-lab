import subprocess
import yaml
import pickle
from pathlib import Path
from flask import Flask, abort, request

app = Flask(__name__)
ARCHIVE_DIR = Path(__file__).resolve().parent

@app.route("/run")
def run():
    filename = request.args.get("file")
    if not filename:
        abort(400)

    archive_path = (ARCHIVE_DIR / filename).resolve()
    try:
        archive_path.relative_to(ARCHIVE_DIR)
    except ValueError:
        abort(400)

    return str(subprocess.run(["tar", "xzf", str(archive_path)], check=False).returncode)

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
