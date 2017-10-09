import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: Twitter |
    a-[status]->b |
    ""-[consumerKey]->b |
    ""-[consumerSecret]->b |
    ""-[accessToken]->b |
    ""-[accessTokenSecret]->b
`);

pipe.run({a:{data:['hell0', 'from', 'hackgt'], iterable: true}});
