import {Client} from "@microsoft/microsoft-graph-client"
import {IEvent} from "../../interface"

namespace CalendarApi {
	type EventApiResponse = {
		value: Array<EventApiResponseEvent>
	}
	type EventApiResponseEvent = {
		id: string,
		subject: string,
		start: ApiDate,
		end: ApiDate
	}
	type ApiDate = {
		dateTime: string,
		timeZone: string
	}
	
	export async function getEvents(client: Client, from: Date, to: Date): Promise<Array<IEvent>> {
		const events: EventApiResponse = await client.api("/me/events")
			.filter(`start/dateTime ge '${from.toISOString()}' and end/dateTime le '${to.toISOString()}'`)
			.select(["id", "subject", "start", "end"])
			.get()
		
		return events.value.map(convert)
	}
	
	export async function book(client: Client, from: Date, to: Date, subject: string): Promise<IEvent> {
		const options = {
			subject,
			start: {
				dateTime: from.toISOString(),//.replace(/\.[0-9]+/, ""),
				timeZone: "UTC"
			},
			end: {
				dateTime: to.toISOString(),//.replace(/\.[0-9]+/, "")
				timeZone: "UTC"
			}
		}
		
		const event = await client.api("/me/events")
			.post(options)
		
		return convert(event)
	}
	
	function convert(event: EventApiResponseEvent): IEvent {
		return ({
			id: event.id.trim(),
			subject: event.subject ? event.subject.trim() : "No Subject",
			start: new Date(`${event.start.dateTime}Z`),
			end: new Date(`${event.end.dateTime}Z`)
		})
	}
	
}

export default CalendarApi