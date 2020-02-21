import "isomorphic-fetch"
import {Client} from "@microsoft/microsoft-graph-client"
import {IEvent} from "../../interface"
import {GraphApiOptions} from "./lib/interface"
import {TokenProvider} from "./lib/authorization/TokenProvider"
import CachedEventsApi from "./lib/CachedEventsApi"
import {EventEmitter} from "events"
import Converter from "./lib/Converter"

class GraphApi extends EventEmitter {
	private readonly _client: Client
	private readonly _cachedEventsApi: CachedEventsApi
	
	constructor(user_id: string, options: GraphApiOptions) {
		super()
		const tokenProvider = new TokenProvider(user_id, options)
		
		this._client = Client.initWithMiddleware({authProvider: tokenProvider})
		
		this._cachedEventsApi = this.InitCachedApi(user_id)
	}
	
	private InitCachedApi(user_id: string): CachedEventsApi {
		const api = new CachedEventsApi({
			client: this._client,
			refreshPeriodMS: 5000
		})
		
		// just passing
		api.on("update", (events) => this.emit("update", user_id, events))
		api.on("error", (e) => {
			this.emit("error", user_id, e?.statusCode || 500)
		})
		
		return api
	}
	
	async getEvents(from: Date, to: Date): Promise<Array<IEvent>> {
		return this._cachedEventsApi.Events.filter(evt => to >= evt.start && from <= evt.end)
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
		
		return Converter.convert(event)
	}
}

export {GraphApiOptions} from "./lib/interface"
export default GraphApi