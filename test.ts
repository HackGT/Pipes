import { Encrypt } from "./plugins/encrypt2";
import { Decrypt } from "./plugins/decrypt2";
import { Console } from "./plugins/console2";

let encrypt = new Encrypt({ "password": "gatech" });
let decrypt = new Decrypt({ "password": "gatech" });

encrypt.pipe(new Console()).pipe(decrypt).pipe(new Console());

encrypt.write({
    "data": "Hello, world!"
});
