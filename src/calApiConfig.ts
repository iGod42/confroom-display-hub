import {ICalendarApi} from "./lib/CalendarApi/interface"
import {Office365} from "./lib/CalendarApi/Office365"

export type CalApiConfig = [ICalendarApi, string]

const BASE_URL = process.env.BASE_URL
if (!BASE_URL)
	throw new Error("BASE_URL process env has to be set in a format like http://blah.com")

function initOffice365(): CalApiConfig {
	const clientId = process.env.OFFICE365_CLIENT_ID || ""
	const clientSecret = process.env.OFFICE365_CLIENT_SECRET || ""
	
	if (!clientId || !clientSecret)
		throw new Error("If Office365 is enabled both OFFICE365_CLIENT_ID and " +
			"OFFICE365_CLIENT_SECRET must be set")
	
	const name = "office365"
	const o365 = new Office365(clientId, clientSecret, `${BASE_URL}/authorize/${name}/token`)
	
	return [o365, name]
}

function init(): Array<CalApiConfig> {
	const confs: Array<CalApiConfig> = []
	
	if (process.env.OFFICE365_ENABLED)
		confs.push(initOffice365())
	
	return confs
}

const theConfig = init()
export default theConfig