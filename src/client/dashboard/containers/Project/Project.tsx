import { connect, Dispatch } from 'react-redux';
import * as React from "react";
import { Project as IProject } from '../../reducers/projects';
import { deleteProject, inspectProject, savePipe } from '../../actions/projects';
import { Redirect } from 'react-router-dom';
import ProjectSettings from '../../components/ProjectSettings/ProjectSettings';
import { Profile } from '../../reducers/profile';
import PipeSummary from '../../components/PipeSummary/PipeSummary';
import NewPipe from '../../components/NewPipe/NewPipe';
import { dismissErrorMessage } from '../../actions/error';

type StateToProps = {
    projects: [IProject],
    users: [Profile],
    services: { [service: string]: boolean },
    error: {
        showError: boolean,
        errorMessage: string
    }
}

type DispatchToProps = {
    inspectProject: (id: string) => void,
    deleteProject: (id: string) => void
    savePipe: (projectName: string, name: string, description: string) => void,
    dismissErrorMessage: () => void
}

type PassedProps = {
    match: { params: { id: string } }
}

type State = {
    showSettingsModal: boolean,
    showNewPipeModal: boolean
}

type ProjectProps = StateToProps & DispatchToProps & PassedProps;

class Project extends React.Component<ProjectProps, State> {
    private name: string;

    constructor(props: any) {
        super(props);
        this.name = props.match.params.id;

        this.state = {
            showSettingsModal: false,
            showNewPipeModal: false
        };

        this.getProject.bind(this);
    }

    componentWillMount() {
        this.props.inspectProject(this.props.match.params.id);
    }

    private getProject(): IProject {
        return this.props.projects.reduce((val: null | IProject, project: IProject) => {
            return project.name === this.name ? project : val;
        }, null);
    }

    render() {
        if (this.props.services.inspectProject === undefined || this.props.services.inspectProject) {
            return <div className="project">Loading...</div>;
        }

        const project: IProject = this.getProject();

        if (project === null) {
            return <Redirect to="/"/>
        }

        const users: Profile[] = this.props.users.filter((user: Profile) => {
            return user.id in project.users;
        });

        return <div className="project">
            <h1>{project.name}</h1>
            <button onClick={() => {this.setState({ showSettingsModal: true })}}>Settings</button>
            <button onClick={() => {
                this.setState({ showNewPipeModal: true })
            }}>New Pipe
            </button>
            <ProjectSettings
                show={this.state.showSettingsModal}
                project={project}
                users={users}
                onCloseButtonClicked={() => {this.setState({ showSettingsModal: false })}}
                onDeleteButtonClicked={() => {this.props.deleteProject(this.name)}}/>
            <NewPipe
                projectName={project.name}
                show={this.state.showNewPipeModal}
                onCloseButtonClicked={() => {this.setState({ showNewPipeModal: false })}}
                savePipe={this.props.savePipe}
                error={this.props.error}
                saving={this.props.services.savePipe}
                dismissErrorMessage={dismissErrorMessage}/>
            <p>{project.description}</p>

            {project.pipes ? project.pipes.map((pipe) => {
                return <PipeSummary key={pipe.name} projectName={project.name} pipe={pipe}/>
            }) : null}
        </div>;
    }
}

export default connect<StateToProps, DispatchToProps, PassedProps>(
    (state) => ({
        projects: state.projects,
        services: state.services,
        users: state.users,
        error: state.error
    }),
    {
        inspectProject,
        deleteProject,
        savePipe,
        dismissErrorMessage
    }
)(Project);