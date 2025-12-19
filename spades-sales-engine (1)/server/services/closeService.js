const axios = require("axios");

async function closeRequest(apiKey, method, url, data = {}) {
  const base = "https://api.close.com/api/v1";
  return axios({
    method,
    url: base + url,
    data,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }
  }).then(r => r.data);
}

module.exports = { closeRequest };