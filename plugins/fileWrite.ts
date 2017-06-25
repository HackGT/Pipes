import * as fs from "fs";

export let name = "File Write";
export let inputs = {
    "data": "string"
}
export let outputs = {};
export let requires = {
    "filePath": "string"
};

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        fs.writeFile(requires.filePath, input.data, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
