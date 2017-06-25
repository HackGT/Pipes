import * as crypto from "crypto";

export let name = "Decryption";
export let inputs = {
    "authTag": "string",
    "encrypted": "string"
}
export let outputs = {
    "data": "string"
}

export let requires = {
    "password": "string"
}

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        let decipher = crypto.createDecipher("id-aes256-GCM", requires.password);
        decipher.setAuthTag(Buffer.from(input.authTag as string, "hex"));
        let decrypted = decipher.update(input.encrypted, "hex", "utf8");
        try {
            decrypted += decipher.final("utf8");
        }
        catch (err) {
            reject(err);
            return;
        }
        resolve({
            "data": decrypted
        });
    });
}
