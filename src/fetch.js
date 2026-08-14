const axios = require("axios")
const dns = require("dns").promises
const https = require("https")
const { BlockList, isIP } = require("net")

const blockedIpv4Addresses = new BlockList()
const blockedIpv6Addresses = new BlockList()
const publicIpv6Addresses = new BlockList()

publicIpv6Addresses.addSubnet("2000::", 3, "ipv6")

for (const [address, prefix, family] of [
  ["0.0.0.0", 8, "ipv4"],
  ["10.0.0.0", 8, "ipv4"],
  ["100.64.0.0", 10, "ipv4"],
  ["127.0.0.0", 8, "ipv4"],
  ["169.254.0.0", 16, "ipv4"],
  ["172.16.0.0", 12, "ipv4"],
  ["192.0.0.0", 24, "ipv4"],
  ["192.0.2.0", 24, "ipv4"],
  ["192.88.99.0", 24, "ipv4"],
  ["192.168.0.0", 16, "ipv4"],
  ["198.18.0.0", 15, "ipv4"],
  ["198.51.100.0", 24, "ipv4"],
  ["203.0.113.0", 24, "ipv4"],
  ["224.0.0.0", 4, "ipv4"],
  ["240.0.0.0", 4, "ipv4"],
  ["::", 128, "ipv6"],
  ["::1", 128, "ipv6"],
  ["::ffff:0:0", 96, "ipv6"],
  ["64:ff9b::", 96, "ipv6"],
  ["64:ff9b:1::", 48, "ipv6"],
  ["100::", 64, "ipv6"],
  ["2001::", 23, "ipv6"],
  ["2001:db8::", 32, "ipv6"],
  ["2002::", 16, "ipv6"],
  ["3fff::", 20, "ipv6"],
  ["5f00::", 16, "ipv6"],
  ["fc00::", 7, "ipv6"],
  ["fe80::", 10, "ipv6"],
  ["ff00::", 8, "ipv6"]
]) {
  const blockList = family === "ipv4" ? blockedIpv4Addresses : blockedIpv6Addresses
  blockList.addSubnet(address, prefix, family)
}

function isPublicAddress(address) {
  const family = isIP(address)
  if (family === 4) return !blockedIpv4Addresses.check(address, "ipv4")
  if (family === 6) {
    return publicIpv6Addresses.check(address, "ipv6") &&
      !blockedIpv6Addresses.check(address, "ipv6")
  }
  return false
}

async function validateDestination(value) {
  if (typeof value !== "string") throw new Error("Invalid proxy URL")

  const url = new URL(value)
  const allowedHosts = new Set(
    (process.env.PROXY_ALLOWED_HOSTS || "")
      .split(",")
      .map(host => host.trim().toLowerCase())
      .filter(Boolean)
  )

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !allowedHosts.has(url.host.toLowerCase())
  ) {
    throw new Error("Proxy destination is not allowed")
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "")
  const family = isIP(hostname)
  const addresses = family
    ? [{ address: hostname, family }]
    : await dns.lookup(hostname, { all: true, verbatim: true })

  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("Proxy destination does not resolve to a public address")
  }

  return { url, address: addresses[0] }
}

function agentFor(address) {
  return new https.Agent({
    lookup(hostname, options, callback) {
      if (typeof options === "function") callback = options
      if (options && options.all) callback(null, [address])
      else callback(null, address.address, address.family)
    }
  })
}

async function fetchAllowed(value, redirects = 0) {
  const { url, address } = await validateDestination(value)
  const response = await axios.get(url.href, {
    httpsAgent: agentFor(address),
    maxRedirects: 0,
    proxy: false,
    validateStatus: () => true
  })

  if (response.status >= 300 && response.status < 400 && response.headers.location) {
    if (redirects >= 5) throw new Error("Too many redirects")
    return fetchAllowed(new URL(response.headers.location, url).href, redirects + 1)
  }

  if (response.status >= 300) throw new Error(`Proxy request failed with status ${response.status}`)
  return response
}

async function proxy(req, res) {
  const response = await fetchAllowed(req.query.url)
  res.send(response.data)
}

module.exports = proxy
