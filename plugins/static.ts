import { InputPlugin } from "./plugin";

interface Output {
	"static_data": string;
}

export class Static extends InputPlugin<Output> {
	public name = "Static Content";

	constructor(private readonly data: string) {
		super(["static_data"]);

		this.publish("static_data", this.data);
	}
}
