import {Router} from "express"

// @ts-ignore
import apiConfig from "../calApiConfig"
import {IRoom} from "../lib/CalendarApi/interface"

const apis = apiConfig.map(value => value[0])

const router = Router()

router.use("/:roomId", async (req, res) => {
	let foundRooms: Array<IRoom | undefined> = (await Promise.all(apis.map(api => api.getRoom(req.params.roomId))))
	
	if (!foundRooms.length)
		res.sendStatus(404)
	
	res.json(foundRooms[0])
})

router.use("/", async (req, res) => {
	// noinspection TypeScriptValidateJSTypes
	const rooms: Array<Array<IRoom>> = await Promise.all(apis.map(api => api.getAvailableRooms()))
	
	const allRooms = rooms.reduce((flat, toFlatten) => flat.concat(toFlatten), [])
	res.json(allRooms)
})

export default router