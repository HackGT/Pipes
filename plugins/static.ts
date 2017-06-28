import { InputPlugin } from "./plugin";

interface Output {
	"data": string;
}

export class Static extends InputPlugin {
	public name: string = "Static";
	public verbs: string[] = [];
	
	public outputs: (keyof Output)[] = ["data"];

	constructor(private data: string) {
		super();

		let output: Output = {
			data: this.data
		};
		this.push(output);
	}

	public parseLanguage(verb: string, tokens: any[]): any {
		return null;
	}

	public _read(size: number) {
		this.push(null);
	}
}
