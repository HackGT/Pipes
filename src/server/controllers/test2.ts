import { Input } from './nodes/Input';
import { Concat } from './nodes/Concat';
import { Slack } from './nodes/Slack';
import { Twitter } from './nodes/Twitter';
import { Email } from './nodes/Email';
import Pipe from './Pipe';
import { Mapper } from './nodes/Node';
import { Static } from './nodes/Static';

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
const Inputs = {
    content: new Input(), // Takes in value from Pipe and pushes forward { 'data': value }
    token: new Input(),
    twitter_key: new Input(),
    subject: new Input(),
    to: new Input(),
    from: new Input(),
    api_user: new Input(),
    api_key: new Input(),
};

// Map the data from each input to keys 0 and 1
const textMapper = new Mapper({'data': 'text'});
const tokenMapper = new Mapper({'data': 'token'});
const twitterMapper = new Mapper({'data': 'twitter_key'});
const toMapper = new Mapper({'data': 'to'});
const fromMapper = new Mapper({'data': 'from'});
const subjectMapper = new Mapper({'data': 'subject'});
const apiUserMapper = new Mapper({'data': 'api_user'});
const apiKeyMapper = new Mapper({'data': 'api_key'});

const channel = new Static({data: '#announcements'}); // Will always output {'data': 2}
const channelMap = new Mapper({'data': 'channel'}); // Maps the data from the staticVal to key 'len'

const slack = new Slack();
const slackMap = slack.getContentMap()

const email = new Email();
const emailMap = email.getContentMap()

Inputs.token.pipe(tokenMapper);
Inputs.content.pipe(slackMap);
slackMap.pipe(slack);
tokenMapper.pipe(slack);
channel.pipe(channelMap);
channelMap.pipe(slack);

Inputs.content.pipe(emailMap);
emailMap.pipe(email);

Inputs.subject.pipe(subjectMapper);
subjectMapper.pipe(email);

Inputs.to.pipe(toMapper);
toMapper.pipe(email);

Inputs.from.pipe(fromMapper);
fromMapper.pipe(email);

Inputs.api_user.pipe(apiUserMapper);
apiUserMapper.pipe(email);

Inputs.api_key.pipe(apiKeyMapper);
apiKeyMapper.pipe(email);

const pipe = new Pipe(Inputs);
pipe.run({
    content: 'Hello hackGT',
    token: process.env.SLACK_API_KEY,
    twitter_key: process.env.TWITTER_KEY,
    subject: 'Hello from HackGT',
    to: 'joshualaurencio@gmail.com',
    from: 'hello@hack.gt',
    api_user: process.env.API_USER,
    api_key: process.env.API_KEY
});