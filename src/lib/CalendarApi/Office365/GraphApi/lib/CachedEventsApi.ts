import "isomorphic-fetch"
import {Client} from "@microsoft/microsoft-graph-client"
import {EventEmitter} from "events"

import {EventUpdate, IEvent} from "../../../interface"
import {EventApiResponseEvent} from "./interface"
import DeltaQuery from "./DeltaQuery"

function getStartOfUTCDay(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export default class CachedEventsApi extends EventEmitter {
	private readonly _client: Client
	private _lastRefreshDay: Date | undefined
	private _deltaToken: string | null = null
	private _cachedEvents: IEvent[] = []
	
	constructor(options: { client: Client, refreshPeriodMS: number }) {
		super()
		
		this._client = options.client
		
		this.refreshCache = this.refreshCache.bind(this)
		this.fullRefresh = this.fullRefresh.bind(this)
		this.incrementalRefresh = this.incrementalRefresh.bind(this)
		
		this.refreshCache(options.refreshPeriodMS || 5000).then()
	}
	
	private async refreshCache(autoRefresh?: number) {
		
		// full refresh needed
		if (!this._deltaToken || !this._lastRefreshDay || (getStartOfUTCDay(new Date()).getTime() !== this._lastRefreshDay.getTime()))
			// any event that was deleted since the last incremental sync will not be pushed as deleted ... tough titties
			await this.fullRefresh()
		else
			await this.incrementalRefresh(this._deltaToken)
		
		if (autoRefresh) setTimeout(() => this.refreshCache(autoRefresh), autoRefresh)
	}
	
	private async fullRefresh() {
		const {deltaToken, referenceDate, events} = await DeltaQuery.getThreeDayRange(this._client, new Date())
		
		// see what updates we have
		const updates = events
			.filter(evt => !this._cachedEvents.find(ee => ee.id === evt.id)) // find all added ones
			.map<EventUpdate>(evt => ({
				event: CachedEventsApi.convert(evt), // no deleted check necessary
				id: evt.id,
				type: "addedOrUpdated"
			}))
		
		// update cached shit
		this._deltaToken = deltaToken
		this._lastRefreshDay = referenceDate
		this._cachedEvents = events.map(CachedEventsApi.convert)
		
		if (updates.length)
			// raise change events
			this.emit("update", updates)
	}
	
	private async incrementalRefresh(callDeltaToken: string) {
		const {events, deltaToken} = await DeltaQuery.getIncrement(this._client, callDeltaToken)
		
		this._cachedEvents = this._cachedEvents
			.filter(evt => !events.find(change => change.id === evt.id && change["@removed"])) // filter deleted ones
			.concat(events
				.filter(change => !change["@removed"]) // filter out the removed ones to not add them again
				.map(CachedEventsApi.convert) // and map them to be nice events
			)
		
		const updates = events
			.map<EventUpdate>(evt => ({
				event: evt["@removed"] ? undefined : CachedEventsApi.convert(evt),
				type: evt["@removed"] ? "removed" : "addedOrUpdated",
				id: evt.id
			}))
		
		if (updates.length)
			// in this case all events are necessarily updates
			this.emit("update", updates)
		
		this._deltaToken = deltaToken
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
	
	get Events(): IEvent[] {
		return this._cachedEvents
	}
}