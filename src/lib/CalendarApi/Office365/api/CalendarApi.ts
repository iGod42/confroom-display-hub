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
			.filter(`start/dateTime ge '${from.toISOString()}' and end/dateTime lt '${to.toISOString()}'`)
			.select(["id", "subject", "start", "end"])
			.get()
		
		return events.value.map(convert)
	}
	
	function convert(event: EventApiResponseEvent): IEvent {
		return ({
			id: event.id.trim(),
			subject: event.subject.trim(),
			start: new Date(event.start.dateTime),
			end: new Date(event.end.dateTime)
		})
	}
}

export default CalendarApi