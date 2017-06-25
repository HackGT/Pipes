interface InputFormat {
    [nodeName: string]: {
        plugin?: string;
        output: {
            [nodeAndValue: string]: string;
        };
        [otherField: string]: any;
    }
}

export async function parseAndRun(json: string): Promise<void> {
    let parsedRequest: InputFormat = JSON.parse(json);
    function isComplete(nodeName: string): boolean {
        for (let outputKey of Object.keys(parsedRequest[nodeName].output)) {
            let outputValue = parsedRequest[nodeName].output[outputKey];
            let prefix = outputValue.split(".")[0];
            if (prefix !== nodeName) {
                return false;
            }
        }
        return true;
    }
    function traverse(nodeName: string): void {
        
    }

    for (let nodeName of Object.keys(parsedRequest)) {
        if (!isComplete(nodeName)) {
            continue;
        }
        traverse(nodeName);
    }
}
