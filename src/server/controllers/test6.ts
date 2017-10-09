import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: GraphQL |
    a-[query]->b |
    "http://graphql.nodaljs.com/graph"-[url]->b |
    "POST"-[method]->b
`);

pipe.run({a:{data:"users", iterable: false}});