import {EventApiResponse, EventApiResponseEvent} from "./interface"
import {Client} from "@microsoft/microsoft-graph-client"

const DELTA_API = "/me/calendarView/delta"

namespace DeltaQuery {
	type DeltaResponse = {
		events: EventApiResponseEvent[],
		deltaToken: string | null
	}
	
	function getStartOfUTCDay(date: Date): Date {
		return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
	}
	
	async function runDeltaQuery(client: Client, query: { [key: string]: string }): Promise<DeltaResponse> {
		let nextLink: string | undefined
		let events: EventApiResponseEvent[] = []
		let deltaLink: string | undefined
		do {
			const queryToRun = !nextLink ? query : {$skiptoken: (new URL(nextLink)).searchParams.get("$skiptoken") || ""}
			
			const response: EventApiResponse = await client.api(DELTA_API)
				.query(queryToRun)
				.get()
			events = events.concat(response.value)
			nextLink = response["@odata.nextLink"]
			deltaLink = response["@odata.deltaLink"]
		} while (nextLink)
		
		return {events, deltaToken: deltaLink ? new URL(deltaLink).searchParams.get("$deltatoken") : null}
	}
	
	export async function getThreeDayRange(client: Client, referenceDate: Date): Promise<DeltaResponse & { referenceDate: Date }> {
		const refStart = getStartOfUTCDay(referenceDate)
		const from = new Date(refStart)
		const to = new Date(from)
		
		from.setHours(from.getHours() - 24)
		to.setHours(to.getHours() + 24)
		
		return {
			...(await runDeltaQuery(client, {
				StartDateTime: from.toISOString(),
				EndDateTime: to.toISOString()
			})), referenceDate: refStart
		}
	}
	
	export async function getIncrement(client: Client, deltaToken: string): Promise<DeltaResponse> {
		return runDeltaQuery(client, {
			$deltatoken: deltaToken
		})
	}
}

export default DeltaQuery