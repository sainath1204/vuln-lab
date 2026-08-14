import subprocess
from pathlib import Path
import yaml
import pickle
from flask import Flask, abort, request

app = Flask(__name__)
ARCHIVE_DIR = Path(__file__).resolve().parent / "archives"

@app.route("/run")
def run():
    filename = request.args.get("file", "")
    archive_path = (ARCHIVE_DIR / filename).resolve()
    if not filename or Path(filename).name != filename or archive_path.parent != ARCHIVE_DIR or not archive_path.is_file():
        abort(400)
    result = subprocess.run(["tar", "xzf", str(archive_path)], shell=False, check=False)
    return str(result.returncode)

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
