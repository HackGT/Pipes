import Pipe from '../controllers/pipes/pipe';
import Value from '../controllers/nodes/primitives/value';
import Logger from '../controllers/nodes/services/logger';
import Input from '../controllers/nodes/primitives/input';
import Concat from '../controllers/nodes/manipulators/concat';

const a = new Input();
const b = new Input();
const c = new Concat();
const o = new Logger();

c.inputs['data1'] = a;
c.inputs['data2'] = b;
o.inputs['foo'] = c;
o.inputs['bar'] = new Value(' yeah!!');

const pipe = new Pipe({ a: a, b: b }, [o]);
pipe.run({
    a: 'hello ',
    b: 'world',
});