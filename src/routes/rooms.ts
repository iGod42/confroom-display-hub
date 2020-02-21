import {Request, Router} from "express"

// @ts-ignore
import apiConfig from "../calApiConfig"
import {IRoom} from "../lib/CalendarApi/interface"

const apis = apiConfig.map(value => value[0])

const router = Router()

function flattenArray<T>(array: Array<Array<T>>): Array<T> {
	return array.reduce((flat, toFlatten) => flat.concat(toFlatten), [])
}

type DateRange = {
	from: Date,
	to: Date
}

function validateDateParams(req: Request): DateRange | undefined {
	const {from, to} = req.query
	if (!from || !to)
		return
	try {
		const fromDate = new Date(from)
		const toDate = new Date(to)
		
		if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))
			return
		
		return {from: fromDate, to: toDate}
	} finally {
	}
}

router.post("/:roomId/events", async (req, res, next) => {
	const dateRange = validateDateParams(req)
	if (!dateRange)
		return res.status(400).end("from and to query parameters must be set to dates")
	try {
		const results = (await Promise.all(apis.map(api => api.book(req.params.roomId, dateRange.from, dateRange.to, "Reserved on room")))).filter(a => a)
		
		if (!results.length)
			return res.sendStatus(404)
		
		return res.json(results[0])
	} catch (e) {
		next(e)
	}
})

router.patch("/:roomId/events/:eventId", async (req, res, next) => {
	try {
		const changedEvent = (await Promise.all(apis.map(api => api.update(req.params.roomId, {
			...req.body,
			id: req.params.eventId
		})))).find(a => a)
		
		if (!changedEvent)
			return res.sendStatus(404)
		
		return res.json(changedEvent)
	} catch (e) {
		next(e)
	}
})

router.use("/:roomId/events", async (req, res, next) => {
	const dateRange = validateDateParams(req)
	if (!dateRange)
		return res.status(400).end("from and to query parameters must be set to dates")
	try {
		const foundRooms = await Promise.all(apis.map(api => api.getEvents(req.params.roomId, dateRange.from, dateRange.to)))
		res.json(flattenArray(foundRooms))
	} catch (e) {
		next(e)
	}
})

router.use("/:roomId", async (req, res, next) => {
	try {
		let foundRooms: Array<IRoom | undefined> = (await Promise.all(apis.map(api => api.getRoom(req.params.roomId))))
		
		if (!foundRooms.length)
			res.sendStatus(404)
		
		res.json(foundRooms[0])
	} catch (e) {
		next(e)
	}
})

router.use("/", async (req, res, next) => {
	try {
		// noinspection TypeScriptValidateJSTypes
		const rooms: Array<Array<IRoom>> = await Promise.all(apis.map(api => api.getAvailableRooms()))
		
		const allRooms = flattenArray(rooms)
		res.json(allRooms)
	} catch (e) {
		next(e)
	}
})

export default router