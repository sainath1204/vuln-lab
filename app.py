import os
import tarfile
from pathlib import Path
import yaml
import pickle
from flask import Flask, abort, request

app = Flask(__name__)
ARCHIVE_DIR = Path(__file__).resolve().parent


def _within(base, path):
    return os.path.commonpath((str(base), str(path))) == str(base)

@app.route("/run")
def run():
    filename = request.args.get("file")
    if not filename:
        abort(400)

    archive_path = (ARCHIVE_DIR / filename).resolve()
    if not _within(ARCHIVE_DIR, archive_path) or not archive_path.is_file():
        abort(400)

    try:
        with tarfile.open(str(archive_path), "r:gz") as archive:
            for member in archive.getmembers():
                destination = (ARCHIVE_DIR / member.name).resolve()
                if (not _within(ARCHIVE_DIR, destination)
                        or not (member.isfile() or member.isdir())):
                    abort(400)
            archive.extractall(str(ARCHIVE_DIR))
    except (tarfile.TarError, OSError):
        abort(400)

    return "", 204

@app.route("/load")
def load():
    return yaml.load(request.args.get("data"))

@app.route("/deser")
def deser():
    return pickle.loads(request.data)
