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
message: Input, slack: Slack, c: Concat, log: Logger |

"xoxb-253125341936-T9RWxB7LVveKh0EVxSCBxRGQ"-[token]->slack |
"#bot-test-2"-[channel]->slack |
"2"-[len]->c |

"[slack #announcements]: @channel  " -[0]->c |
message -[1]->c |
c-[text]->slack |
c-[data]->log
`);
pipe2.run({
    message: { data: 'hi', iterable: false }
}, out => console.log(out));