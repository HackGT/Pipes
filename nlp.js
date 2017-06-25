"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const language = require("@google-cloud/language")({
    key: "AIzaSyDWkI00Um5GxP5Hu1R2I2uRf5FxpmiR7bs",
    projectId: "testfirstapp1",
});
function text2graph(plugins, text, getIntegration) {
    return __awaiter(this, void 0, void 0, function* () {
        let annotation = yield new Promise((resolve, reject) => {
            language.annotate(text, (err, annotation) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(annotation);
                }
            });
        });
        let tokens = annotation.tokens;
        let verbs = {};
        for (let plug of Object.keys(plugins)) {
            if (plugins[plug].verbs) {
                for (let verb of plugins[plug].verbs) {
                    verbs[verb] = plug;
                }
            }
        }
        let parsed = [];
        let curr_verb = null;
        // parse into the available verbs
        for (let token of tokens) {
            if (token.partOfSpeech.tag == "VERB" && verbs[token.text.content]) {
                curr_verb = token.text.content;
                parsed.push({
                    verb: curr_verb,
                    tokens: []
                });
            }
            else {
                if (parsed.length == 0) {
                    parsed.push({
                        hanging_begin: true,
                        tokens: [],
                    });
                }
                parsed[parsed.length - 1].tokens.push(token);
            }
        }
        let commands = [];
        let constant_uid = 0;
        let last_plugin = -1;
        // take out conjunctions and other special cases
        for (let window of parsed) {
            let window_text = window.tokens;
            // take out a last 'then'
            if (window_text[window_text.length - 1].text.content == "then") {
                window_text.pop();
            }
            // take out a last 'and'
            if (window_text[window_text.length - 1].text.content == "and") {
                window_text.pop();
            }
            // give it to the right plugin
            let plugin = plugins[verbs[window.verb]];
            let parsed = plugin.parse_language(window.verb, window.tokens);
            let step_id = `${verbs[window.verb]}-${commands.length}`;
            let inputs_covered = {};
            for (let input of Object.keys(parsed)) {
                if (parsed[input] === undefined || parsed[input] === null) {
                    continue;
                }
                inputs_covered[input] = true;
                let constant_label = `constant-${constant_uid}`;
                constant_uid += 1;
                commands.push({
                    [constant_label]: {
                        value: parsed[input],
                        output: {
                            [`${step_id}.${input}`]: `${constant_label}.value`,
                        }
                    },
                });
            }
            for (let input of Object.keys(plugin.inputs)) {
                if (!inputs_covered[input]) {
                    if (last_plugin < 0) {
                        console.error("Could not find output to get data from!", input, verbs[window.verb]);
                        return null;
                    }
                    console.log(input, "not covered! getting it from last output");
                    let id = Object.keys(commands[last_plugin])[0];
                    let plugin = plugins[commands[last_plugin][id].plugin];
                    let output = Object.keys(plugin.outputs)[0];
                    commands[last_plugin][id].output[`${step_id}.${input}`] = `${id}.${output}`;
                }
            }
            last_plugin = commands.length;
            commands.push({
                [step_id]: {
                    plugin: verbs[window.verb],
                    instance: yield getIntegration(verbs[window.verb]),
                    output: {},
                },
            });
        }
        let graph = {};
        for (let command of commands) {
            let id = Object.keys(command)[0];
            graph[id] = command[id];
        }
        return graph;
    });
}
exports.text2graph = text2graph;
// loadPlugins()
//     .catch(console.error.bind(console))
//         .then(a => {
//             text2graph(
//                 plugins,
//                 "translate happy canadian independence day to french and then tweet it"
//             )
//             .catch(console.error.bind(console))
//             .then((i) => console.log(JSON.stringify(i, null, 4)));
//         })
//# sourceMappingURL=nlp.js.map