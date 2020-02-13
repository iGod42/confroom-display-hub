export function getFormUrlEncodedBody(object: object): string {
	// @ts-ignore
	return Object.keys(object).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join("&")
}