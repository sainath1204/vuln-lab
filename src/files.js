const fs = require("fs")
const path = require("path")

function read(req, res) {
  const dataRoot = fs.realpathSync("/var/data")
  const filePath = fs.realpathSync(path.resolve(dataRoot, req.query.path))
  const relativePath = path.relative(dataRoot, filePath)

  if (relativePath === ".." || relativePath.startsWith(".." + path.sep) || path.isAbsolute(relativePath)) {
    throw new Error("Invalid file path")
  }

  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0)
  const file = fs.openSync(filePath, flags)

  try {
    res.send(fs.readFileSync(file))
  } finally {
    fs.closeSync(file)
  }
}

module.exports = read
