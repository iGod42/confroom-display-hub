import "dotenv/config"
import expressServer from "./server"
import http from "http"
import initSocks from "./socks/SocksServer"

const port = process.env.PORT || 3000

const server = http.createServer(expressServer)

initSocks(server)

server.listen(port, () => {
	console.log(`Express started at port ${port}`)
})

