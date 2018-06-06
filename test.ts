// import * as fs from "fs";
// import * as path from "path";
// import { loadPlugins, parse, execute } from "./runner";

// loadPlugins().then(() => {
//     return parse(
//         JSON.parse(
//             fs.readFileSync(
//                 path.join(__dirname, "graph_examples", "cryptography-proposed.json")
//             , "utf8")
//         )
//     )
// }).then(execute);
import { Static } from "./plugins/static";
import { Console } from "./plugins/console";
import { Capitalization } from "./plugins/capitalization";

const stat = new Static("Hello world from Pipeline!");

stat.pipe(new Capitalization(), {"static_data": "text"}).pipe(new Console(), {"capitalized": "console_data"});
