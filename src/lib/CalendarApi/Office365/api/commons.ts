import qs from "querystring"

const scope = ["offline_access", "Calendars.ReadWrite"]

export function getAuthUrl(client_Id: string, redirect_uri: string) {
	return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${
		qs.stringify({
			client_Id,
			response_type: "code",
			redirect_uri,
			scope: scope.join(" ")
		})
	}`
}