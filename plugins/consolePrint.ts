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
