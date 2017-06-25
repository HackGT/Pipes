import { InputFormat } from "./runner";

const language = require("@google-cloud/language")({
    key: "AIzaSyDWkI00Um5GxP5Hu1R2I2uRf5FxpmiR7bs",
    projectId: "testfirstapp1",
});

type Plugins = {[p: string]: any};

export async function text2graph(plugins: Plugins, text: string, getIntegration: (instanceName: string) => Promise<any>): Promise<InputFormat | null> {
    let annotation = await new Promise<any>((resolve, reject) => {
        language.annotate(text, (err: Error, annotation: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(annotation);
            }
        });
    });
    let tokens = annotation.tokens;
    let verbs: {[verb: string]: string} = {};

    for (let plug of Object.keys(plugins)) {
        if (plugins[plug].verbs) {
            for (let verb of plugins[plug].verbs) {
                verbs[verb] = plug;
            }
        }
    }

    let verb_split: any[] = [];
    let curr_verb = null;

    // parse into the available verbs
    for (let i = 0; i < tokens.length; i += 1) {
        let token = tokens[i];
        if (verbs[token.text.content]) {
            curr_verb = token.text.content;
            verb_split.push({
                verb: curr_verb,
                index: i,
                tokens: []
            });
        }
        else {
            if (verb_split.length == 0) {
                verb_split.push({
                    hanging_begin: true,
                    tokens: [],
                });
            }
            verb_split[verb_split.length - 1].tokens.push(token);
        }
    }

    let commands: InputFormat[] = [];
    let constant_uid = 0;
    let last_plugin = -1;

    for (let i = 0; i < verb_split.length; i += 1) {
        // take out conjunctions and other special cases
        let frame = verb_split[i];
        let frame_text = frame.tokens;
        // take out a last 'then'
        if (frame_text[frame_text.length - 1].text.content == "then") {
            frame_text.pop();
        }

        // take out a last 'and'
        if (frame_text[frame_text.length - 1].text.content == "and") {
            frame_text.pop();
        }

        // give it to the right plugin
        let plugin = plugins[verbs[frame.verb]];
        let parsed = plugin.parse_language(frame.verb, frame.tokens, frame.index);
        let step_id: string = `${verbs[frame.verb]}-${i}`;
        let inputs_covered: {[f: string]: boolean} = {};

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
                    console.error("Could not find output to get data from!",
                                  input, verbs[frame.verb]);
                    return null;
                }
                console.log(input, "not covered! getting it from last output");
                let id = Object.keys(commands[last_plugin])[0];
                let plugin = plugins[commands[last_plugin][id].plugin!];
                let output = Object.keys(plugin.outputs)[0];

                commands[last_plugin][id].output[`${step_id}.${input}`] = `${id}.${output}`;
            }
        }

        last_plugin = commands.length;
        commands.push({
            [step_id]: {
                plugin: verbs[frame.verb],
                instance: await getIntegration(verbs[frame.verb]),
                output: {},
            },
        });
    }


    let graph: InputFormat = {};

    for (let command of commands) {
        let id = Object.keys(command)[0];
        graph[id] = command[id];
    }

    return graph;
}


// import * as path from "path";
// import * as fs from "fs";
// import * as util from "util";

// let plugins: { [pluginName: string]: any } = {}

// async function loadPlugins(dir: string = "plugins") {
//     let readdirAsync = util.promisify(fs.readdir) as (path: string | Buffer) => Promise<string[]>;
//     let files = await readdirAsync(path.join(__dirname, dir));
//     plugins = [];
//     for (let file of files) {
//         if (path.extname(file) === ".js") {
//             let module = require(path.join(__dirname, dir, file));
//             plugins[path.basename(file, ".js")] = module;
//             console.log(`Loaded plugin: ${module.name} from ${file}`);
//         }
//     }
// }

// loadPlugins()
//     .catch(console.error.bind(console))
//         .then(a => {
//             text2graph(
//                 plugins,
//                 "translate happy canadian independence day to french and then tweet it and slack it to random"
//             )
//             .catch(console.error.bind(console))
//             .then((i) => console.log(JSON.stringify(i, null, 4)));
//         })

