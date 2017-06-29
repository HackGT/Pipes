import { InputPlugin } from "./plugin";

interface Output {
	"data": string;
}

export class Static extends InputPlugin {
	public static readonly verbs: string[] = [];
	
	public static readonly outputs: (keyof Output)[] = ["data"];

	private readonly data: string;

	constructor(config: { data: string }) {
		super();

		this.data = config.data;
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
