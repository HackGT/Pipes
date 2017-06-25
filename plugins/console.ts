export let name = "Console Print";
export let inputs = {
    "data": "string"
}
export let outputs = {};
export let requires = {};

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        console.log(input.data);
        resolve();
    });
}

export let verbs = ["print", "log"];

interface Inputs {
    data: string | null;
}
export function parse_language(verb: string, tokens: any[]): Inputs {
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
