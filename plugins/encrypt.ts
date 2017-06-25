import * as crypto from "crypto";

export let name = "Encryption";
export let inputs = {
    "data": "string"
}
export let outputs = {
    "authTag": "string",
    "encrypted": "string"
}

export let requires = {
    "password": "string"
}

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        let cipher = crypto.createCipher("id-aes256-GCM", requires.password);
        let encrypted = cipher.update(input.data, "utf8", "hex");
        encrypted += cipher.final("hex");
        resolve({
            "authTag": cipher.getAuthTag().toString("hex"),
            "encrypted": encrypted
        });
    });
}
