import apiConfig from "../calApiConfig"
import {ICalendarApi} from "../lib/CalendarApi/interface"
import {Server as httpsServer} from "https"
import {Server as httpServer} from "http"
import socketIo, {Server} from "socket.io"

function registerListener(api: ICalendarApi, io: Server) {
	api.on("update", function (roomId, events) {
		io.to(roomId).emit("update", events)
	})
	/*	api.on("error", function () {
			console.log("error", new Date().toISOString(), arguments)
		})*/
}

export default function (server: httpsServer | httpServer) {
	const io = socketIo(server)
	
	const apis = apiConfig.map(value => value[0])
	apis.forEach(api => {
		api.getAvailableRooms()
		registerListener(api, io)
	})
	
	io.on("connection", function (socket) {
		socket.join(socket.handshake.query.roomId)
	})
}