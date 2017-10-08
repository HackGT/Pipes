import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: Push |
    a-[content]->b |
    "716b24e9-1e12-4086-bf11-b1a5e1a5a7df"-[appId]->b |
    "MDMyNmQ5N2YtZDU5YS00OGY3LWE4MTMtYzMwMjc0MzNmZmJi"-[apiKey]->b
`);
// https://mighty-sierra-43455.herokuapp.com to sign up for notifications
pipe.run({a:{data:"hello", iterable: false}});
