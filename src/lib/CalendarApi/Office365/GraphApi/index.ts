import "isomorphic-fetch"
import {Client} from "@microsoft/microsoft-graph-client"
import {IEvent} from "../../interface"
import {EventApiResponse, EventApiResponseEvent, GraphApiOptions} from "./lib/interface"
import {TokenProvider} from "./lib/authorization/TokenProvider"

class GraphApi {
	private readonly _client: Client
	
	constructor(user_id: string, options: GraphApiOptions) {
		const tokenProvider = new TokenProvider(user_id, options)
		
		this._client = Client.initWithMiddleware({authProvider: tokenProvider})
	}
	
	async getEvents(from: Date, to: Date): Promise<Array<IEvent>> {
		const events: EventApiResponse = await this._client.api("/me/events")
			.filter(`start/dateTime ge '${from.toISOString()}' and end/dateTime le '${to.toISOString()}'`)
			.select(["id", "subject", "start", "end"])
			.get()
		
		return events.value.map(GraphApi.convert)
		
	}
	
	async book(from: Date, to: Date, subject: string): Promise<IEvent> {
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
		
		const event = await this._client.api("/me/events")
			.post(options)
		
		return GraphApi.convert(event)
	}
	
	private static convert(event: EventApiResponseEvent): IEvent {
		if (!event.start || !event.end)
			throw new Error("Start and end required for event to be converted")
		return ({
			id: event.id.trim(),
			subject: event.subject ? event.subject.trim() : "No Subject",
			start: new Date(`${event.start.dateTime}Z`),
			end: new Date(`${event.end.dateTime}Z`)
		})
	}
}

export {GraphApiOptions} from "./lib/interface"
export default GraphApi