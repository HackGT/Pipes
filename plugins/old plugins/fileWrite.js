"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.name = "File Write";
exports.verbs = ["write", "save"];
exports.inputs = {
    "filePath": "string",
    "data": "string"
};
exports.outputs = {};
exports.requires = {};
exports.run = (requires, input) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(input.filePath, input.data, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
function parse_language(verb, tokens) {
    let text = [];
    for (let token of tokens) {
        text.push(token.text.content);
    }
    if (text.length >= 3 && text[0] === "it" && text[1] === "to") {
        return {
            filePath: text.slice(2).join(""),
            data: null
        };
    }
    else {
        return {
            filePath: "output.txt",
            data: null
        };
    }
}
exports.parse_language = parse_language;
//# sourceMappingURL=fileWrite.js.map