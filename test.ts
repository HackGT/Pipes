import { Encrypt } from "./plugins/encrypt2";
import { Decrypt } from "./plugins/decrypt2";
import { Console } from "./plugins/console2";
import { Mapper } from "./plugins/plugin";

let encrypt = new Encrypt({ "password": "gatech" });
let decrypt = new Decrypt({ "password": "gatech" });

let beginning = encrypt.pipe(new Mapper({"encrypted": "data"}, "Encrypt"));
encrypt.write({
    "data": "Hello, world!"
});

setTimeout(() =>{
    beginning.pipe(new Console()).pipe(decrypt).pipe(new Console());
}, 500);
