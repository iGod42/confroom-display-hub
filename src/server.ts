import express, {ErrorRequestHandler} from "express"

const app = express()

app.use("/", (req, res) => {
	res.end("hello world")
})

app.use((req, res) => {
	res.sendStatus(404)
})

const defaultErrorHandler: ErrorRequestHandler = ((err, req, res, next) => {
	if (process.env.NODE_ENV !== "production")
		console.error(err.stack)
	res.status(500).send("Something broke!")
})

app.use(defaultErrorHandler)

export default app