// import { Input } from './nodes/Input';
// import { Concat } from './nodes/Concat';
// import { Logger } from './nodes/Logger';
// import Pipe from './Pipe';
// import { Mapper } from './Node';
// import { Static } from './plugins/Static';
//
// // Input 1
// //        \
// //        [0]
// //          \
// //           Concatenate(2) - [data] - Log
// //          /
// //        [1]
// //        /
// // Input 2
//
// // Define out inputs
// const Inputs = {
//     input0: new Input(),
//     input1: new Input(), // Takes in value from Pipe and pushes forward { 'data': value }
//     input2: new Input(), // Takes in value from Pipe and pushes forward { 'data': value }
//     input3: new Input(),
//     input4: new Input(),
//     input5: new Input()
// };
//
// // Map the data from each input to keys 0 and 1
// const input0Toconcat = new Mapper({'data': '0'});
// const input1Toconcat = new Mapper({'data': '1'});
// const input2Toconcat = new Mapper({'data': '2'});
// const input3Toconcat = new Mapper({'data': '3'});
// const input4Toconcat = new Mapper({'data': '4'});
// const input5Toconcat = new Mapper({'data': '5'});
//
// const staticVal = new Static({data: '6'}); // Will always output {'data': 2}
// const staticValToconcat = new Mapper({'data': 'len'}); // Maps the data from the staticVal to key 'len'
//
// const concat = new Concat(); // Takes len and waits for two inputs of key [0...len-1] then pushes forward { 'data': val[0] + val[1] + ... + val[len] }
//
// const log = new Logger(); // Takes input of key data and logs it to console
//
// Inputs.input0.pipe(input0Toconcat);
// Inputs.input1.pipe(input1Toconcat);
// Inputs.input2.pipe(input2Toconcat);
// Inputs.input3.pipe(input3Toconcat);
// Inputs.input4.pipe(input4Toconcat);
// Inputs.input5.pipe(input5Toconcat);
//
// staticVal.pipe(staticValToconcat);
// staticValToconcat.pipe(concat);
// input0Toconcat.pipe(concat);
// input1Toconcat.pipe(concat);
// input2Toconcat.pipe(concat);
// input3Toconcat.pipe(concat);
// input4Toconcat.pipe(concat);
// input5Toconcat.pipe(concat);
// concat.pipe(log);
//
// const pipe = new Pipe(Inputs);
// pipe.run({
//     input0: {
//         data: 'lmao ',
//         isIterable: false
//     },
//     input1: {
//     	data: 'you are ',
//     	isIterable: false
//     },
//     input2: {
//     	data: ['2', '4', '6'],
//     	isIterable: true,
//     },
//     input3: {
//         data: ' edgy ',
//         isIterable: false
//     },
//     input4: {
//         data: ['1', '3', '5'],
//         isIterable: true
//     },
//     input5: {
//         data: ' me.',
//         isIterable: false
//     }
// });