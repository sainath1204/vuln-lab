const axios = require("axios")

const CONNECTION_TIMEOUT_MS = 3000
const TOTAL_TIMEOUT_MS = 5000
const MAX_RESPONSE_BYTES = 1024 * 1024
const MAX_CONCURRENT_REQUESTS = 10

let activeRequests = 0

function fetchBounded(url) {
  return new Promise((resolve, reject) => {
    const cancellation = axios.CancelToken.source()
    let responseStream
    let settled = false

    const finish = (error, value) => {
      if (settled) return
      settled = true
      clearTimeout(totalTimeout)
      if (error) reject(error)
      else resolve(value)
    }

    const totalTimeout = setTimeout(() => {
      const error = new Error("Upstream request timed out")
      error.code = "ETIMEDOUT"
      cancellation.cancel(error.message)
      if (responseStream) responseStream.destroy()
      finish(error)
    }, TOTAL_TIMEOUT_MS)

    axios.get(url, {
      timeout: CONNECTION_TIMEOUT_MS,
      maxContentLength: MAX_RESPONSE_BYTES,
      responseType: "stream",
      cancelToken: cancellation.token
    }).then(response => {
      responseStream = response.data
      const chunks = []
      let receivedBytes = 0

      responseStream.on("data", chunk => {
        receivedBytes += chunk.length
        if (receivedBytes > MAX_RESPONSE_BYTES) {
          const error = new Error("Upstream response is too large")
          error.code = "ERESPONSETOOLARGE"
          cancellation.cancel(error.message)
          responseStream.destroy()
          finish(error)
          return
        }
        chunks.push(chunk)
      })
      responseStream.on("end", () => finish(null, Buffer.concat(chunks)))
      responseStream.on("error", finish)
    }, finish)
  })
}

async function proxy(req, res) {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return res.status(503).send("Proxy is busy")
  }

  activeRequests += 1
  try {
    const data = await fetchBounded(req.query.url)
    res.send(data)
  } catch (error) {
    const status = error.code === "ERESPONSETOOLARGE" ? 413 :
      error.code === "ETIMEDOUT" || error.code === "ECONNABORTED" ? 504 : 502
    res.status(status).send("Upstream request failed")
  } finally {
    activeRequests -= 1
  }
}

module.exports = proxy
