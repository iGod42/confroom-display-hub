import express, {ErrorRequestHandler} from "express"
import authorizeRoute from "./routes/authorize"
import roomsRoute from "./routes/rooms"
import bodyParser from "body-parser"
import cors from "cors"
import passport from "passport"
import AuthStrategy from "./lib/auth/AuthStrategy"

passport.use(AuthStrategy.strategy)

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(passport.initialize())

app.use("/authorize", authorizeRoute)
app.use("/rooms", passport.authenticate(AuthStrategy.name, {session: false}), roomsRoute)

app.use("/", (req, res) => {
	res.end("hello world")
})

app.use((req, res) => {
	res.sendStatus(404)
})

const defaultErrorHandler: ErrorRequestHandler = ((err, req, res, next) => {
	if (process.env.NODE_ENV !== "production")
		console.error(err)
	res.status(500).send("Something broke!")
})

app.use(defaultErrorHandler)

export default app