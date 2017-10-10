import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: GraphQL |
    a-[query]->b |
    "https://checkin.hack.gt/graphql"-[url]->b |
    "POST"-[method]->b|
    ""-[auth]->b
`);

var data = `{
  users(n: 5, filter: {attending: true, application_branch: "Mentor"}) {
    user {
      name
      email
    }
    tags {
      tag {
        name
      }
      checked_in
    }
  }
}`
pipe.run({a:{data:data, iterable: false}});