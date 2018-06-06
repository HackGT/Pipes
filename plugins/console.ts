import { OutputPlugin } from "./plugin";

interface Input {
	"console_data": string;
}

export class Console extends OutputPlugin<Input> {
	public name = "Console";

	constructor() {
		super(["console_data"]);

		this.addReceiver("console_data", async data => {
			console.log(`[Pipeline LOG]: ${data}`);
		});
	}
}
