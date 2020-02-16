import GraphApi, {GraphApiOptions} from "./GraphApi"

export default class ApiPool {
	private readonly _options: GraphApiOptions
	private readonly _apis: Map<string, GraphApi>
	
	constructor(options: GraphApiOptions) {
		this._options = options
		this._apis = new Map<string, GraphApi>()
	}
	
	getApi(user_id: string): GraphApi {
		
		let api = this._apis.get(user_id)
		if (api) return api
		
		api = new GraphApi(user_id, this._options)
		
		this._apis.set(user_id, api)
		
		return api
	}
}