import Pipe from './Pipe';

const pipe = new Pipe();
pipe.parseFromString(`
    a: Input, b: GraphQL, c: Email, d: Concat, e: GraphQL |
    a-[query]->b |
    "https://checkin.hack.gt/graphql"-[url]->b |
    "POST"-[method]->b|
    "ENTER_AUTH_HERE"-[auth]->b |
    "users.user.email"-[selector]->b |
    b-[to]->c |
    "foobar@hack.gt"-[from]->c |
    "Does notifications work?"-[subject]->c |
    "Hello "-[0]->d |
    a-[query]->e |
    "https://checkin.hack.gt/graphql"-[url]->e |
    "POST"-[method]->e|
    "ENTER_AUTH_HERE"-[auth]->e |
    "users.user.name"-[selector]->e |
    e-[1]->d |
    ",<br> If you got this then notifications works probably!"-[2]->d |
    "3"-[len]->d |
    d-[text]->c |
    "API_KEY"-[api_key]->c |
    "API_USER"-[api_user]->c
    `);

var data = `{
  users(n: 4, filter: {attending: true, application_branch: "Mentor"}) {
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
pipe.run({a:{data:data, iterable: false}}, out => console.log(out));