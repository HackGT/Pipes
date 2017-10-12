import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: Facebook |
    a-[message]->b |
    ""-[id]->b |
    ""-[accessToken]->b
`);
// https://mighty-sierra-43455.herokuapp.com to sign up for notifications
pipe.run({a:{data:"hello", iterable: false}}, out => console.log(out));
