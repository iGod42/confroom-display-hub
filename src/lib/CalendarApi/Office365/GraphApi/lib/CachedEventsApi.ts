import "isomorphic-fetch"
import {Client} from "@microsoft/microsoft-graph-client"
import {EventEmitter} from "events"

import {EventUpdate, IEvent} from "../../../interface"
import DeltaQuery from "./DeltaQuery"
import Converter from "./Converter"

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
	
	private async refreshCache(autoRefresh: number) {
		let refreshTime = autoRefresh
		
		try {
			// full refresh needed
			if (!this._deltaToken || !this._lastRefreshDay || (getStartOfUTCDay(new Date()).getTime() !== this._lastRefreshDay.getTime()))
				// any event that was deleted since the last incremental sync will not be pushed as deleted ... tough titties
				await this.fullRefresh()
			else
				await this.incrementalRefresh(this._deltaToken)
		} catch (e) {
			// if we have a 401 there's no need to retry manual action is required
			if (e?.statusCode === 401) {
				// slow refresh by 10 times but no longer than 5 min´
				refreshTime = Math.min(refreshTime * 10, 300000)
			}
			
			this.emit("error", e)
		}
		setTimeout(() => this.refreshCache(refreshTime), refreshTime)
	}
	
	private async fullRefresh() {
		const {deltaToken, referenceDate, events} = await DeltaQuery.getThreeDayRange(this._client, new Date())
		
		// see what updates we have
		const updates = events
			.filter(evt => !this._cachedEvents.find(ee => ee.id === evt.id)) // find all added ones
			.map<EventUpdate>(evt => ({
				event: Converter.convert(evt), // no deleted check necessary
				id: evt.id,
				type: "addedOrUpdated"
			}))
		
		// update cached shit
		this._deltaToken = deltaToken
		this._lastRefreshDay = referenceDate
		this._cachedEvents = events.map(Converter.convert)
		
		if (updates.length)
			// raise change events
			this.emit("update", updates)
	}
	
	private async incrementalRefresh(callDeltaToken: string) {
		const {events, deltaToken} = await DeltaQuery.getIncrement(this._client, callDeltaToken)
		if (events.length) {
			this._cachedEvents = this._cachedEvents
				.filter(evt => !events.find(change => change.id === evt.id)) // filter deleted ones
				.concat(events
					.filter(change => !change["@removed"]) // filter out the removed ones to not add them again
					.map(Converter.convert) // and map them to be nice events
				)
			
			const updates = events
				.map<EventUpdate>(evt => ({
					event: evt["@removed"] ? undefined : Converter.convert(evt),
					type: evt["@removed"] ? "removed" : "addedOrUpdated",
					id: evt.id
				}))
			
			if (updates.length)
				// in this case all events are necessarily updates
				this.emit("update", updates)
		}
		this._deltaToken = deltaToken
	}
	
	get Events(): IEvent[] {
		return this._cachedEvents
	}
}