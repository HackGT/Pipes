// xoxb-249687587650-zaCOqyjbja9YSIqYI65Cpyak

import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: Slack |
    a-[text]->b |
    "#test5"-[channel]->b |
    "xoxb-252879716786-j0dDXNwhVNsoh5J5QHYQuui9"-[token]->b
`);

pipe.run({a:{data:['hi', 'hello', 'bye'], iterable: true}}, out => console.log(out));
