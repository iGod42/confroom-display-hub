import {Router} from "express"
import conf, {CalApiConfig} from "../calApiConfig"

const router = Router()

// if interface checks weren't such a pain in the ass, we should filter for impelmentations of OauthApi
conf.forEach((item: CalApiConfig) => {
	const theApi = item[0]
	const name = item[1]

	router.use(`/${name}/token`, (req, res) => {
		console.log('in token')
		theApi.authTokenReceived(req.query.code)
		res.end("Thanks for registring")
	})
	router.use(`/${name}`, (req, res) => {
		console.log('in normal')
		res.redirect(theApi.getAuthorizationUrl())
	})
})

export default router