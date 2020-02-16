export type EventApiResponse = {
	"@odata.nextLink"?: string,
	"@odata.deltaLink"?: string,
	value: Array<EventApiResponseEvent>
}

export type EventApiResponseEvent = {
	id: string,
	subject?: string,
	start?: ApiDate,
	end?: ApiDate,
	isAllDay?: boolean
	"@removed"?: { reason: string }
}

type ApiDate = {
	dateTime: string,
	timeZone: string
}
