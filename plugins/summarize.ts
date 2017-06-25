const unirest = require("unirest");
const {exec} = require('child_process');
const extractor = require('unfluff');

export let name = "Summarizer";

export let inputs = {
	"url": "string",
};

export let outputs = {
	"summarized": "string"
};

export let requires = {
	length: "string"
};

export let run = (input: any, requires: any) => {
	return new Promise<any>((resolve, reject) => {
		exec("curl -s " + input.url + " | unfluff", (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}

			// get summary
			unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer-text")
			.header("X-Mashape-Key", "0ZMCFUgJcZmsheN5g0vybr743wQ3p16mXWzjsnkZtcNv6rfY3O")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.header("Accept", "application/json")
			.send("sentnum=" + requires.length)
			.send("text=" + JSON.parse(stdout).text)
			.end(function (result) {
			 	var summary = "";
			 	for (var i = 0; i < result.body.sentences.length; i++) {
			 		summary += result.body.sentences[i];
			 		summary += " ";
			 	}
			 	resolve({"summarized": summary});
			}).catch((err: any) => {
				console.error("ERROR: ", err);
				reject(err);
			});
		});

		
	})
}

