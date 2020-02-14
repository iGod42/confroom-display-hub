import {ITokenStorage} from "../../interface"

export interface IOffice365Options {
	clientId: string,
	clientSecret: string,
	redirectUrl: string,
	tokenStorage: ITokenStorage
}
