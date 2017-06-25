import * as crypto from "crypto";

export let name = "Decryption";
export let verbs = ["decrypt"];
export let inputs = {
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
        let {authTag, encrypted} = JSON.parse(input.encrypted);
        decipher.setAuthTag(Buffer.from(authTag as string, "hex"));
        let decrypted = decipher.update(encrypted, "hex", "utf8");
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

export function parse_language(verb: string, tokens: any[]) {
    let text: string[] = [];

    for (let token of tokens) {
        text.push(token.text.content);
    }

    if (text.length === 1 && text[0] === "it") {
        text.pop();
    }

    return {
        encrypted: text.length === 0 ? null : text.join(" ")
    }
}
