import {Router} from "express"

import apiConfig from "../calApiConfig"
import {IRoom} from "../lib/CalendarApi/interface"

const apis = apiConfig.map(value => value[0])

const router = Router()

router.use("/", async (req, res) => {
	// noinspection TypeScriptValidateJSTypes
	const rooms: Array<Array<IRoom>> = await Promise.all(apis.map(api => api.getAvailableRooms()))
	
	const allRooms = rooms.reduce((flat, toFlatten) => flat.concat(toFlatten), [])
	res.json(allRooms)
})

export default router