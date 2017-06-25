const unirest = require("unirest");

const {exec} = require('child_process');

import {exec} from "child_process";


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
			.send("sentnum=" + "5")
			.send("text=" + JSON.parse(stdout).text)
			.end(function (result: any) {
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

export let verbs = ["summarize"];

export function parse_language(verb: string, tokens: any[]) {
	if (tokens[0] === "it") {
		return {url: null};
	} else {
		return {url: tokens[0]};
	}
}