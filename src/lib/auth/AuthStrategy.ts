import {Strategy as CustomStrategy} from "passport-custom"

// obviously this is a fucked up and temporary Solution
// Proper way would probably be doing client certificates

const strategy = new CustomStrategy(
	function (req, callback) {
		
		if (req.query.client_key === process.env.CLIENT_KEY)
			return callback(null, "batman")
		return callback(null, undefined)
	}
)

export default {strategy, name: "custom"}