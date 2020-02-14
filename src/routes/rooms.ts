import {Router} from "express"

// @ts-ignore
import apiConfig from "../calApiConfig"
import {IRoom} from "../lib/CalendarApi/interface"

const apis = apiConfig.map(value => value[0])

const router = Router()

function flattenArray<T>(array: Array<Array<T>>): Array<T> {
	return array.reduce((flat, toFlatten) => flat.concat(toFlatten), [])
}

router.use("/:roomId/events", async (req, res) => {
	let fromDate = new Date(),
		toDate = new Date()
	const {from, to} = req.query
	try {
		fromDate = new Date(from)
		toDate = new Date(to)
	} catch (e) {
	}
	if (!from || !to || !fromDate || !toDate)
		return res.status(404).end("from and to query parameters must be set to dates")
	
	let foundRooms = await Promise.all(apis.map(api => api.getEvents(req.params.roomId, fromDate, toDate)))
	// @ts-ignore
	res.json(flattenArray(foundRooms))
})

router.use("/:roomId", async (req, res) => {
	let foundRooms: Array<IRoom | undefined> = (await Promise.all(apis.map(api => api.getRoom(req.params.roomId))))
	
	if (!foundRooms.length)
		res.sendStatus(404)
	
	res.json(foundRooms[0])
})

router.use("/", async (req, res) => {
	// noinspection TypeScriptValidateJSTypes
	const rooms: Array<Array<IRoom>> = await Promise.all(apis.map(api => api.getAvailableRooms()))
	
	const allRooms = flattenArray(rooms)
	res.json(allRooms)
})

export default router