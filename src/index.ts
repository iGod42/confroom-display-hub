import "dotenv/config"
import server from "./lib/server"

const port = process.env.PORT || 3000

server.listen(port, () => {
	console.log(`Server started at port ${port}`)
})