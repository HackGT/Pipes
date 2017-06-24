import * as express from "express";
// import * as serveStatic from "serve-static";
import * as compression from "compression";
// import * as cookieParser from "cookie-parser";

const PORT = 3000;

export let app = express();
app.use(compression());
// TODO: let cookieParserInstance = cookieParser(undefined, COOKIE_OPTIONS);
// app.use(cookieParserInstance);

app.route("/").get((request, response) => {
    response.send("Hello, world!");
});

app.listen(PORT, () => {
	console.log(`BoH4 system started on port ${PORT}`);
});