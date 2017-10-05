import { Router } from 'express';
import { ensureAuthenticated } from '../util/auth';
import { Project } from '../model/Project';
import Pipe from '../controllers/Pipe';


const router: Router = Router();

router.post('/:project/:pipe', async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project
        })
        .select('pipes')
        .populate({ path: 'pipes', match: { 'name': req.params.pipe } });

    if (project === null) {
        res.sendStatus(404);
    }

    if (project.pipes.length === 0) {
        res.status(400);
        res.json({ message: 'That pipe does not exist in this project' });
    }

    const pipe = new Pipe();
    pipe.parseFromString(project.pipes[0].graph);
    res.json(pipe.run(req.body));
});

export default router;
