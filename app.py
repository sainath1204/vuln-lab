import subprocess
from pathlib import Path
import yaml
import pickle
from flask import Flask, abort, request

app = Flask(__name__)
ARCHIVE_DIR = (Path(app.root_path) / "archives").resolve()

@app.route("/run")
def run():
    archive_name = request.args.get("file")
    if not archive_name:
        abort(400)

    archive_path = (ARCHIVE_DIR / archive_name).resolve()
    if ARCHIVE_DIR not in archive_path.parents or not archive_path.is_file():
        abort(400)

    subprocess.run(
        ["tar", "xzf", str(archive_path)], cwd=ARCHIVE_DIR, check=True
    )
    return "", 204

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
