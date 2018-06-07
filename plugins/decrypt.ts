import { TransformPlugin } from "./plugin";
import * as crypto from "crypto";

interface Input {
	"password": string;
	"encryptionResult": {
		"iv": Buffer;
		"salt": Buffer;
		"authTag": Buffer;
		"data": Buffer;
	};
}
interface Output {
	"data": string;
}

export class Decrypt extends TransformPlugin<Input, Output> {
	public name = "Decryption";
	
	private password: string | null = null;

	constructor() {
		super(["encryptionResult", "password"], ["data"]);

		this.addReceiver("password", async data => {
			this.password = data;
		});
		this.addReceiver("encryptionResult", async data => {
			if (!this.password) {
				console.error("Password must be set before sending data");
				return;
			}

			let key = await new Promise<Buffer>((resolve, reject) => {
				crypto.pbkdf2(this.password!, data.salt, 1000, 32, "sha256", (err, key) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(key);
				});
			});

			let decipher = crypto.createDecipheriv("id-aes256-GCM", key, data.iv);
			decipher.setAuthTag(data.authTag);
			let decrypted = Buffer.concat([decipher.update(data.data), decipher.final()]);
		
			await this.publish("data", decrypted.toString("utf8"));
		});
	}
}
