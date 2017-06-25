import * as crypto from "crypto";

export let name = "Encryption";
export let verbs = ["encrypt"];
export let inputs = {
    "data": "string"
}
export let outputs = {
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
            "encrypted": JSON.stringify({
                "authTag": cipher.getAuthTag().toString("hex"),
                "encrypted": encrypted
            })
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
        data: text.length === 0 ? null : text.join(" ")
    }
}
