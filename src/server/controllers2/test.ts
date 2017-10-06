import { Input } from './nodes/Input';
import { Concat } from './nodes/Concat';
import { Logger } from './nodes/Logger';
import Pipe from '../controllers/Pipe';
import { Mapper } from '../controllers/Node';
import { Static } from '../controllers/plugins/Static';

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
    input1: new Input(), // Takes in value from Pipe and pushes forward { 'data': value }
    input2: new Input() // Takes in value from Pipe and pushes forward { 'data': value }
};

// Map the data from each input to keys 0 and 1
const input1Toconcat = new Mapper({'data': '0'});
const input2Toconcat = new Mapper({'data': '1'});

const staticVal = new Static({data: '2'}); // Will always output {'data': 2}
const staticValToconcat = new Mapper({'data': 'len'}); // Maps the data from the staticVal to key 'len'

const concat = new Concat(); // Takes len and waits for two inputs of key [0...len-1] then pushes forward { 'data': val[0] + val[1] + ... + val[len] }

const log = new Logger(); // Takes input of key data and logs it to console

Inputs.input1.pipe(input1Toconcat);
Inputs.input2.pipe(input2Toconcat);
staticVal.pipe(staticValToconcat);
staticValToconcat.pipe(concat);
input1Toconcat.pipe(concat);
input2Toconcat.pipe(concat);
concat.pipe(log);

const pipe = new Pipe(Inputs);
pipe.run({
    input1: {
    	data:'hello',
    	iterable: false
    },
    input2: {
    	data: ' world',
    	iterable: false
    }
});