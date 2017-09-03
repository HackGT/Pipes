import Pipe from '../controllers/pipes/pipe';

const pipe2 = new Pipe();
console.log(pipe2.parseFromString(
    'a: input, b: input, c: concat, o: logger |\n' +
    'a -[data1]-> c |\n' +
    'b -[data2]-> c |\n' +
    'c -[foo]-> o |\n' +
    '" yeah!!" -[bar]-> o\n'));
pipe2.run({
    a: 'hello ',
    b: 'world',
});