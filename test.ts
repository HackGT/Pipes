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
import { Encrypt } from "./plugins/encrypt";
import { Decrypt } from "./plugins/decrypt";

const stat = new Static("Hello world from Pipeline!");

const password = new Static("passw0rd");
const encrypt = new Encrypt();
const decrypt = new Decrypt();
password.pipe(encrypt, {"static_data": "password"}, false);
password.pipe(decrypt, {"static_data": "password"});

stat.pipe(new Capitalization(), {"static_data": "text"})
    .pipe(new Console(), {"capitalized": "console_data"})
    .pipe(encrypt, {"console_data": "data"});
encrypt.pipe(new Console(), {"encryptedSimple": "console_data"}, false);
encrypt.pipe(decrypt, {"encryptionResult": "encryptionResult"}).pipe(new Console(), {"data": "console_data"});
