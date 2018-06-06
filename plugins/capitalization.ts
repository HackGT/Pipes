import { TransformPlugin } from "./plugin";

interface Input {
	"text": string;
}
interface Output {
    "capitalized": string;
}

export class Capitalization extends TransformPlugin<Input, Output> {
	public name = "Capitalization";

	constructor() {
		super(["text"], ["capitalized"])

		this.addReceiver("text", async data => {
            let transformed = data.toUpperCase();
			await this.publish("capitalized", transformed);
		});
	}
}
