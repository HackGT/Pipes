import { TransformPlugin } from "./plugin";
import * as crypto from "crypto";

interface Input {
	"data": string;
	"password": string;
}
interface Output {
	"encryptionResult": {
		"iv": Buffer;
		"salt": Buffer;
		"authTag": Buffer;
		"data": Buffer;
	};
	"encryptedSimple": string;
}

export class Encrypt extends TransformPlugin<Input, Output> {
	public name = "Encryption";
	
	private key: Buffer | null = null;
	private iv: Buffer | null = null;
	private salt: Buffer | null = null;

	constructor() {
		super(["data", "password"], ["encryptionResult", "encryptedSimple"]);

		this.addReceiver("password", async data => {
			return new Promise<void>((resolve, reject) => {
				this.salt = crypto.randomBytes(32);
				crypto.pbkdf2(data, this.salt, 1000, 32, "sha256", (err, key) => {
					if (err) {
						reject(err);
						return;
					}
					this.key = key;
					resolve();
				});
			});
		});
		this.addReceiver("data", async data => {
			if (!this.key || !this.salt) {
				console.error("Password must be set before sending data");
				return;
			}
			
			this.iv = crypto.randomBytes(16);
			let cipher = crypto.createCipheriv("id-aes256-GCM", this.key, this.iv);
			let encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
		
			await this.publish("encryptionResult", {
				"iv": this.iv,
				"salt": this.salt,
				"authTag": cipher.getAuthTag(),
				"data": encrypted
			});
			await this.publish("encryptedSimple", encrypted.toString("hex"));
		});
	}
}
