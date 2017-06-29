import { TransformPlugin, pipingWords } from "./plugin";
import * as crypto from "crypto";

interface Input {
	"encrypted": string;
}
interface Output {
	"data": string;
}

export class Decrypt extends TransformPlugin {
	public static readonly pluginName: string = "Decrypt";
	public static readonly verbs: string[] = ["decrypt"];
	
	public static readonly inputs: (keyof Input)[] = ["encrypted"];
	public static readonly outputs: (keyof Output)[] = ["data"];

	constructor(private password: string) {
		super();
	}

	private derivePassword(salt: Buffer): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			crypto.pbkdf2(this.password, salt, 10000, 32, "sha256", (err, key) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(key);
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
			"encrypted": text.length === 0 ? null : text.join(" ")
		}
	}

	public async _transform(chunk: Input, encoding: string, callback: Function) {
        let encrypted = JSON.parse(chunk.encrypted);
        let salt = Buffer.from(encrypted.salt, "hex");
        let iv = Buffer.from(encrypted.iv, "hex");

		let decipher = crypto.createDecipheriv("id-aes256-GCM", await this.derivePassword(salt), iv);
        decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));
		let decrypted = decipher.update(encrypted.encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");

		let output: Output = {
            "data": decrypted
		};
		this.push(output);
		callback();
	}
}
