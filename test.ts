import { Encrypt } from "./plugins/encrypt2";
import { Decrypt } from "./plugins/decrypt2";
import { Console } from "./plugins/console2";

let encrypt = new Encrypt("gatech");
let decrypt = new Decrypt("gatech");

encrypt.pipe(new Console()).pipe(decrypt).pipe(new Console());

encrypt.write({
    "data": "Hello, world!"
});
