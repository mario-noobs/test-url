import axios from 'axios'

const url = `https://test-url-6jxo.onrender.com`
const interval = 30000

function reloadWebsite() {
  axios
    .get(`${url}/ping`)
    .then((response) => {
      console.log(
        `Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`,
      )
    })
    .catch((error) => {
      console.error(
        `Error reloading at ${new Date().toISOString()}:`,
        error.message,
      )
    })
}

setInterval(reloadWebsite, interval)
