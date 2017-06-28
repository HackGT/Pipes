import { OutputPlugin, pipingWords } from "./plugin";

interface Input {
	"data": string;
}

export class Console extends OutputPlugin {
	public name: string = "Console Print";
	public verbs: string[] = ["print", "log"];
	
	public inputs: (keyof Input)[] = ["data"];

	constructor() {
		super();
	}

	public parseLanguage(verb: string, tokens: any[]): { [P in keyof Input]: string | null; } {
		let text: string[] = [];

		for (let token of tokens) {
			text.push(token.text.content);
		}
		if (text.length === 1 && pipingWords.indexOf(text[0]) !== -1) {
			text.pop();
		}

		return {
			"data": text.length === 0 ? null : text.join(" ")
		}
	}

	public _write(chunk: Input, encoding: string, callback: Function) {
        super._write(chunk, encoding, callback);

        console.log(`[Pipes LOG]: ${chunk.data}`);

		callback();
	}
}
