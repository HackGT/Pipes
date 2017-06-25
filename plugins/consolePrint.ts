export let name = "Console Print";
export let inputs = {
    "data": "string"
}
export let outputs = {};
export let required = {};

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, response) => {
        console.log(input.data);
        resolve();
    });
}
