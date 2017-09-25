import * as path from 'path';
import { Router } from 'express';
import { ensureAuthenticated } from '../util/auth';
import { Project } from '../model/Project';
import * as validate from 'express-validation';
import { IPipe, Pipe } from '../model/Pipe';
import { validateName, validation } from '../util/project';
import { User } from '../model/User';
import uuid = require('uuid/v4');
import { saveDocumentOrError } from '../util/common';

const router: Router = Router();

const authenticate = ensureAuthenticated({ message: 'You must be logged in to view this.' });

/**
 * Information retrieval
 * GET      /projects/                       Get the title and description of every project
 * GET      /projects/:project               Get a summary of one particular object (users, pipe names, pipe api)
 * GET      /projects/:project/users         Get a list of collaborators and public/private flag
 * GET      /projects/:project/pipes         Get a detailed view of every pipe in the project
 * GET      /projects/:project/pipes/:pipe   Get a detailed view of just one pipe in the project
 * GET      /projects/:project/keys          Get a summary view of all of the API keys
 * GET      /projects/:project/keys/:key     Get a summary view of all of the API keys
 *
 * Manipulators
 * POST     /projects                           Create a new project
 * DELETE   /projects/:project                  Delete a project
 * POST     /projects/:project/users            Add a new collaborator
 * DELETE   /projects/:project/users/:user      Remove a collaborator
 * POST     /projects/:project/pipes            Create a new pipe
 * PUT      /projects/:project/pipes/:pipe      Update a particular pipe
 * DELETE   /projects/:project/pipes/:pipe      Delete a particular pipe
 * POST     /projects/:project/keys             Create a new API key
 * DELETE   /projects/:project/keys/:key        Delete an API key
 */

/**
 * return a list of projects that the user is allowed to see
 */
router.get('/', authenticate, async (req, res, next) => {
    const projects = await Project.find({
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('_id name description isPublic');
    res.json(projects);
});

/**
 * create a new project
*/
router.post('/', validate(validation.post), authenticate, async (req: any, res, next) => {
    if (!validateName(req.body.name)) {
        res.status(400);
        return res.send({ message: 'The project name can only be letters, numbers, dashes, and underscores' });
    }


    const exists = await Project.findOne({name: req.body.name});
    if(exists !== null) {
        res.status(400);
        return res.send({ message: 'That project name is already in use.' });
    }

    const project = new Project({
        name: req.body.name,
        description: req.body.description,
        users: [req.user._id],
        pipes: [],
        keys: [],
        isPublic: req.body.isPublic
    });

    if (await saveDocumentOrError(project, res)) {
        res.json(project);
    }
});

// return the project object
router.get('/:project', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .populate('pipes');

    if (project !== null) {
        res.json(project);
    } else {
        res.sendStatus(404);
    }
});

router.delete('/:project', authenticate, async (req, res, next) => {
    const project = await Project.findOneAndRemove({ name: req.params.project });
    if (project !== null) {
        res.json({message: 'Project has successfully been deleted'});
    } else {
        res.sendStatus(404);
    }
});

// return the people who can see the project
router.get('/:project/users', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('users')
        .populate('users');

    if (project !== null) {
        res.json(project.users);
    } else {
        res.sendStatus(404);
    }
});

// add a new person to the project
router.post('/:project/users', validate(validation.users.post), authenticate, async (req, res, next) => {
    const userPromise = User.findById((req.body.userId));
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('users')
        .populate('users');

    if (project !== null) {
        const user = await userPromise;
        if (user === null) {
            res.status(400);
            res.json({ message: 'Must input a valid user id' });
        }
        project.users.push(user);

        if (saveDocumentOrError(project, res)) {
            res.json(project.users);
        }
    } else {
        res.sendStatus(404);
    }
});

// remove someone from a project
router.delete('/:project/users/:user', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('users')
        .populate('users');

    if (project !== null) {
        const index = project.users.indexOf(req.params.user);
        if (index === -1) {
            res.status(400);
            res.json({ message: 'User is not in this project' });
        }
        project.users.splice(index, 1);
        if (saveDocumentOrError(project, res)) {
            res.json(project.users);
        }
    } else {
        res.sendStatus(404);
    }
});

// return the pipes in the object
router.get('/:project/pipes', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('pipes')
        .populate('pipes');

    if (project !== null) {
        res.json(project.pipes);
    } else {
        res.sendStatus(404);
    }
});

// create a new pipe in the project
router.post('/:project/pipes', validate(validation.pipes.post), authenticate, async (req, res, next) => {
    if (!validateName(req.body.name)) {
        res.status(400);
        return res.send({ message: 'The pipe name can only be letters, numbers, dashes, and underscores' });
    }

    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('pipes')
        .populate('pipes');

    if (project !== null) {
        if (!project.pipes.reduce((bool, pipe) => pipe.name !== req.body.name && bool, true)) {
            res.status(400);
            return res.send({ message: 'That pipe already exists in this project' });
        }

        const pipe = new Pipe({
            name: req.body.name,
            description: req.body.description,
            graph: ''
        });
        if (await saveDocumentOrError(pipe, res)) {
            project.pipes.push(pipe);

            if (await saveDocumentOrError(project, res)) {
                return res.json(project.pipes);
            }
        }
    } else {
        res.sendStatus(404);
    }
});

// return a detailed version of a pipe
router.get('/:project/pipes/:pipe', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('pipes')
        .populate({ path: 'pipes', match: { 'name': req.params.pipe } });

    if (project !== null) {
        if (project.pipes.length === 0) {
            res.status(400);
            res.json({ message: 'That pipe does not exist in this project' });
        }
        res.json(project.pipes[0]);
    } else {
        res.sendStatus(404);
    }
});

// update a particular pipe
router.put('/:project/pipes/:pipe', validate(validation.pipes.put), authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('pipes')
        .populate({ path: 'pipes', match: { 'name': req.params.pipe } });

    if (project !== null) {
        if (project.pipes.length === 0) {
            res.status(400);
            res.json({ message: 'That pipe does not exist in this project' });
        }
        const pipe = project.pipes[0];
        pipe.name = req.body.name || pipe.name;
        pipe.description = req.body.description || pipe.description;
        pipe.graph = req.body.graph || pipe.graph;
        if (saveDocumentOrError(pipe, res)) {
            res.json(pipe);
        }
    } else {
        res.sendStatus(404);
    }
});

// delete a particular pipe
router.delete('/:project/pipes/:pipe', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('pipes')
        .populate({ path: 'pipes', match: { 'name': req.params.pipe } });

    if (project !== null) {
        if (project.pipes.length === 0) {
            res.status(400);
            res.json({ message: 'That pipe does not exist in this project' });
        }
        project.pipes = [] as [IPipe];
        if (saveDocumentOrError(project, res)) {
            res.json(project);
        }
    } else {
        res.sendStatus(404);
    }
});

router.get('/:project/keys', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('keys.name');

    if (project !== null) {
        res.json(project.keys);
    } else {
        res.sendStatus(404);
    }
});

router.get('/:project/keys/:key', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('keys')
        .where('keys.name', req.params.key);

    if (project !== null) {
        res.json(project);
    } else {
        res.sendStatus(404);
    }
});

router.post('/:project/keys', validate(validation.keys.post), authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('keys');

    if (project !== null) {
        const key = {
            name: req.body.name,
            id: uuid(),
            secret: uuid()
        };
        project.keys.push(key);
        if (saveDocumentOrError(project, res)) {
            res.json(key);
        }
    } else {
        res.sendStatus(404);
    }
});

router.delete('/:project/keys/:key', authenticate, async (req, res, next) => {
    const project = await Project.findOne({
            name: req.params.project,
            $or: [{ users: req.user._id },
                { isPublic: true }]
        })
        .select('keys');

    if (project !== null) {
        let index = null;
        for (let i = 0; i < project.keys.length; i++) {
            if (project.keys[i].name === req.body.name) {
                index = i;
            }
        }

        if (index === null) {
            res.status(400);
            res.json({ message: 'That key name does not exist in this project' });
        }

        project.keys.splice(index, 1);

        if (saveDocumentOrError(project, res)) {
            res.json(project.keys.map((key) => key.name));
        }
    } else {
        res.sendStatus(404);
    }
});

export default router;