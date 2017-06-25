interface InputFormat {
    [nodeName: string]: {
        plugin?: string;
        output: {
            [nodeAndValue: string]: string;
        };
        [otherField: string]: any;
    }
}

export async function parseAndRun(plugins: {[field: string]: any}, json: string): Promise<void> {
    let parsedRequest: InputFormat = JSON.parse(json);
    let completed: {[node: string]: boolean} = {};

    function isReady(nodeName: string): boolean {
        if (completed[nodeName]) {
            return false;
        }
        if (parsedRequest[nodeName].plugin) {
            let inputs = plugins[parsedRequest[nodeName].plugin!].inputs;
            for (let input of Object.keys(inputs)) {
                if (!parsedRequest[nodeName][input]) {
                    return false;
                }
            }
            return true;
        }
        for (let outputKey of Object.keys(parsedRequest[nodeName].output)) {
            let outputValue = parsedRequest[nodeName].output[outputKey];
            let [mod, key] = outputValue.split(".");

            if (!parsedRequest[mod][key]) {
                return false;
            }
        }
        return true;
    }

    async function traverse(nodeName: string) {
        let node = parsedRequest[nodeName];

        if (node.plugin) {
            // get the setup stuff
            let required = {};

            // run the plugin
            console.log("Running", nodeName);
            let result = await plugins[node.plugin].run(required, node);

            // assign the outputs from the result
            console.log("Assignig Outputs", nodeName);
            if (!result) {
                return;
            }
            for (let resultKey of Object.keys(result)) {
                parsedRequest[nodeName][resultKey] = result[resultKey];
            }
        }

        // assign any of the outputs that have to do with this plugin
        for (let output of Object.keys(node.output)) {
            let [mod, key] = output.split(".");
            let [rmod, rkey] = node.output[output].split(".");

            parsedRequest[mod][key] = parsedRequest[rmod][rkey];
        }
    }

    let containsIncomplete: boolean = true;

    while (containsIncomplete) {
        containsIncomplete = false;
        for (let nodeName of Object.keys(parsedRequest)) {
            console.log("On module", nodeName);
            if (!isReady(nodeName)) {
                console.log("Not ready", nodeName);
                containsIncomplete = true;
                continue;
            }
            console.log("Ready", nodeName);
            await traverse(nodeName);
            console.log("Complete", nodeName);
            completed[nodeName] = true;
        }
    }
}

const TEST_JSON: any = {
    "text": {
        "value": "hi",
        "language": "spanish",
        "output": {
            "translate_1.sentence": "text.value",
            "translate_1.language": "text.language"
        }
    },
    "translate_1": {
        "plugin": "translate",
        "output": {
            "twitter_1.tweet":  "translate_1.translated"
        }
    },
    "twitter_1": {
        "plugin": "twitter",
        "output": {}
    }
}

const PLUGINS: any = {
    "translate": {
        "inputs": {
            "sentence": "text",
            "language": "text",
        },
        "run": async function() {
            console.log("Running translate..", arguments);
            return {
                "translated": "hola"
            };
        }
    },
    "twitter": {
        "inputs": {
            "tweet": "text",
        },
        "run": async function() {
            console.log("Running tweet..", arguments);
            return;
        }
    }
}

export async function test() {
    return await parseAndRun(PLUGINS, JSON.stringify(TEST_JSON));
}

// test().then(console.log.bind(console)).catch(console.error.bind(console));