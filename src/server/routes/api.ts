import { Router } from 'express';
import { ensureAuthenticated } from '../util/auth';
import { Project } from '../model/Project';
import Pipe from '../controllers/Pipe';


const router: Router = Router();

router.post('/:project/:pipe', async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project
        })
        .select('pipes keys')
        .populate({ path: 'pipes', match: { 'name': req.params.pipe } });

    if (project === null) {
        res.sendStatus(404);
    }

    // Handle API Token Auth
    const auth = req.headers.authorization;
    if(!auth)
        return unauthorized(res);
    let parts;
    if(typeof auth=='string')
        parts = auth.split(' ');
    else if(Array.isArray(auth))
        parts = auth[0];

    if (parts.length !== 2) return res.sendStatus(400);

    const scheme = parts[0];
    const credentials = new Buffer(parts[1], 'base64').toString();
    const index = credentials.indexOf(':');

    if ('Basic' != scheme || index < 0) return res.sendStatus(400);

    const user = credentials.slice(0, index);
    const pass = credentials.slice(index + 1);

    let authorized = false;
    console.log(project);
    for(const {id, secret} of project.keys) {
        if(id===user && secret==pass) {
            authorized = true;
            break;
        }
    }

    if(!authorized)
        return unauthorized(res);

    if (project.pipes.length === 0) {
        res.status(400);
        res.json({ message: 'That pipe does not exist in this project' });
    }

    const pipe = new Pipe();
    pipe.parseFromString(project.pipes[0].graph);
    res.json(pipe.run(req.body));
});

function unauthorized(res) {
    res.statusCode = 401;
    res.end('Unauthorized');
}

export default router;
