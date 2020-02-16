import {ITokenStorage} from "../../../../interface"

export type GraphApiOptions = {
	clientId: string,
	clientSecret: string,
	redirectUrl: string,
	tokenStorage: ITokenStorage
}
