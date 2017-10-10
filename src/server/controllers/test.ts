// Input 1
//        \
//        [0]
//          \
//           Concatenate(2) - [data] - Log
//          /
//        [1]
//        /
// Input 2

// Define out inputs
import { Input } from './Input';
import { Mapper } from './Mapper';
import { Static } from './plugins/Static';
import { Concat } from './plugins/Concat';
import { Logger } from './plugins/Logger';
import Pipe from './Pipe';

const pipe2 = new Pipe();
pipe2.parseFromString(`
c: Concat, log: Logger |
["Hello",
"goodbye",
"My bad"] -[0]->c |
"!!!" -[1]->c |
"2" -[len]->c |
c-[data]->log
`);
pipe2.run({}, out => console.log(out));