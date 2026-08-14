import subprocess
from pathlib import Path
import yaml
import pickle
from flask import Flask, abort, request

app = Flask(__name__)
ARCHIVE_DIR = (Path(__file__).resolve().parent / "archives").resolve()

@app.route("/run")
def run():
    filename = request.args.get("file", "")
    if Path(filename).name != filename or not filename.endswith((".tar.gz", ".tgz")):
        abort(400)

    archive = (ARCHIVE_DIR / filename).resolve()
    if archive.parent != ARCHIVE_DIR or not archive.is_file():
        abort(404)

    subprocess.run(["tar", "xzf", str(archive)], check=True)
    return ""

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
