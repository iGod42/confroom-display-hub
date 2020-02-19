import {EventApiResponseEvent} from "./interface"
import {IEvent} from "../../../interface"

namespace Converter {
	export function convert(event: EventApiResponseEvent): IEvent {
		if (!event.start || !event.end)
			throw new Error("Start and end required for event to be converted")
		return ({
			id: event.id.trim(),
			subject: event.subject ? event.subject.trim() : "No Subject",
			start: new Date(`${event.start.dateTime}Z`),
			end: new Date(`${event.end.dateTime}Z`),
			isAllDay: !!event.isAllDay
		})
	}
}

export default Converter