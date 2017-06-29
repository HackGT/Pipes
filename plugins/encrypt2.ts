import { TransformPlugin, pipingWords } from "./plugin";
import * as crypto from "crypto";

interface Input {
	"data": string;
}
interface Output {
	"encrypted": string;
}

export class Encrypt extends TransformPlugin {
	public static readonly verbs: string[] = ["encrypt"];
	
	public static readonly inputs: (keyof Input)[] = ["data"];
	public static readonly outputs: (keyof Output)[] = ["encrypted"];

	private password: Buffer | null = null;
	private iv: Buffer | null = null;
	private salt: Buffer | null = null;
	private readonly rawPassword: string;

	constructor(config: { password: string }) {
		super();
		this.rawPassword = config.password;
	}

	public setPassword(password: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.salt = crypto.randomBytes(32);

			crypto.pbkdf2(password, this.salt, 10000, 32, "sha256", (err, key) => {
				if (err) {
					reject(err);
					return;
				}
				this.password = key;
				resolve();
			})
		});
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

	public async _transform(chunk: Input, encoding: string, callback: Function) {
		await this.setPassword(this.rawPassword);

		this.iv = crypto.randomBytes(16);
		let cipher = crypto.createCipheriv("id-aes256-GCM", this.password, this.iv);
		let encrypted = cipher.update(chunk.data, "utf8", "hex");
		encrypted += cipher.final("hex");

		let output: Output = {
			"encrypted": JSON.stringify({
				"authTag": cipher.getAuthTag().toString("hex"),
				"iv": this.iv.toString("hex"),
				"salt": this.salt!.toString("hex"),
				"encrypted": encrypted
			})
		};
		this.push(output);
		callback();
	}
}
