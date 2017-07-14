"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.name = "File Read";
exports.verbs = ["read", "open"];
exports.inputs = {
    "filePath": "string"
};
exports.outputs = {
    "data": "string"
};
exports.requires = {};
exports.run = (requires, input) => {
    return new Promise((resolve, reject) => {
        fs.readFile(input.filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                data
            });
        });
    });
};
function parse_language(verb, tokens) {
    let text = [];
    for (let token of tokens) {
        text.push(token.text.content);
    }
    return {
        filePath: text.length === 0 ? null : text.join("")
    };
}
exports.parse_language = parse_language;
//# sourceMappingURL=fileRead.js.map