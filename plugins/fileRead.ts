import * as fs from "fs";

export let name = "File Read";
export let inputs = {}
export let outputs = {
    "data": "string"
}
export let requires = {
    "filePath": "string"
}

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        fs.readFile(requires.filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                data
            });
        });
    });
}
