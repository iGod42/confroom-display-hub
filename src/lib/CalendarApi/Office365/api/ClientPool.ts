import "isomorphic-fetch"
import {Client} from "@microsoft/microsoft-graph-client"

import {TokenProvider} from "./TokenProvider"
import {IOffice365Options} from "./IOffice365Options"

export class ClientPool {
	private readonly _options: IOffice365Options
	private readonly _clients: Map<string, Client>
	
	constructor(options: IOffice365Options) {
		this._options = options
		this._clients = new Map<string, Client>()
	}
	
	getClient(user_id: string): Client {
		let client = this._clients.get(user_id)
		if (client) return client
		
		//should we check whether this actually works before continuing?
		const tokenProvider = new TokenProvider(user_id, this._options)
		
		client = Client.initWithMiddleware({authProvider: tokenProvider})
		this._clients.set(user_id, client)
		
		return client
	}
}