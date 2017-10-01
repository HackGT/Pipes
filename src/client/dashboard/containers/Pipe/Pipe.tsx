import { connect } from 'react-redux';
import * as React from "react";
import { inspectProject, updatePipe } from '../../actions/projects';
import { dismissErrorMessage } from '../../actions/error';
import { Redirect } from 'react-router';
import { Project } from '../../reducers/projects';
import { Pipe as IPipe } from '../../reducers/projects';
import { Link } from 'react-router-dom';

type StateToProps = {
    projects: [Project],
    services: { [service: string]: boolean },
    error: {
        showError: boolean,
        errorMessage: string
    }
}

type DispatchToProps = {
    inspectProject: (id: string) => void,
    dismissErrorMessage: () => void,
    updatePipe: (projectId: string, pipeId: string, graph: string) => void
}

type PassedProps = {
    match: { params: { id: string, pipe: string } }
}

type State = {}

type Props = StateToProps & DispatchToProps & PassedProps;

class Pipe extends React.Component<Props, State> {
    input: HTMLTextAreaElement;

    componentWillMount() {
        this.props.inspectProject(this.props.match.params.id);
    }

    private getProject(): Project {
        return this.props.projects.reduce((val: null | Project, project: Project) => {
            return project.name === this.props.match.params.id ? project : val;
        }, null);
    }

    private getPipe(project: Project): IPipe {
        return project.pipes.reduce((val: null | IPipe, pipe: IPipe) => {
            return pipe.name === this.props.match.params.pipe ? pipe : val;
        }, null);
    }

    render() {
        if (this.props.services.inspectProject === undefined || this.props.services.inspectProject) {
            return <div className="project">Loading...</div>;
        }

        const project: Project = this.getProject();

        if (project === null) {
            return <Redirect to="/"/>
        }

        const pipe: IPipe = this.getPipe(project);

        if (pipe === null) {
            return <Redirect to={`/${project.name}`}/>
        }

        return (
            <div>
                <h1><Link to={`/${project.name}`}>{project.name}</Link>/{pipe.name}</h1>
                <p>{pipe.description}</p>
                <pre>
                    {pipe.graph}
                </pre>
                <textarea defaultValue={pipe.graph} ref={(input) => this.input = input}/>
                <button onClick={()=>{this.props.updatePipe(project.name, pipe.name, this.input.value)}}>Save</button>
            </div>
        );
    }
}

export default connect<StateToProps, DispatchToProps, PassedProps>(
    (state) => ({
        projects: state.projects,
        services: state.services,
        error: state.error
    }),
    {
        inspectProject,
        dismissErrorMessage,
        updatePipe
    }
)(Pipe);