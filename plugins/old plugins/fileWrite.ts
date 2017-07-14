import * as fs from "fs";

export let name = "File Write";
export let verbs = ["write", "save"];
export let inputs = {
    "filePath": "string",
    "data": "string"
}
export let outputs = {};
export let requires = {};

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        fs.writeFile(input.filePath, input.data, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function parse_language(verb: string, tokens: any[]) {
    let text: string[] = [];

    for (let token of tokens) {
        text.push(token.text.content);
    }
    if (text.length >= 3 && text[0] === "it" && text[1] === "to") {
        return {
            filePath: text.slice(2).join(""),
            data: null
        }
    }
    else {
        return {
            filePath: "output.txt",
            data: null
        }
    }
}
