import * as fs from "fs";
import * as path from "path";
import { loadPlugins, parse, execute } from "./runner";

loadPlugins().then(() => {
    return parse(
        JSON.parse(
            fs.readFileSync(
                path.join(__dirname, "graph_examples", "cryptography-proposed.json")
            , "utf8")
        )
    )
}).then(execute);
