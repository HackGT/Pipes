import { connect } from 'react-redux';
import * as React from "react";
import { Project } from '../../reducers/projects';
import { saveProject } from '../../actions/projects';
import ProjectSummary from '../../components/ProjectSummary/ProjectSummary';
import { Redirect } from 'react-router-dom';
import { dismissErrorMessage } from '../../actions/error';

type StateToProps = {
    error: {
        showError: boolean,
        errorMessage: boolean
    },
    services: { [name: string]: boolean }
}

type DispatchToProps = {
    saveProject: (name: string, description: string, isPublic: boolean) => void,
    dismissErrorMessage: () => void
}

type Props = StateToProps & DispatchToProps;

type State = {
    redirectToProject: boolean;
}

class NewProject extends React.Component<Props, State> {
    private name: HTMLInputElement;
    private description: HTMLInputElement;
    private isPublic: HTMLInputElement;

    constructor() {
        super();
        this.state = {
            redirectToProject: false
        }
    }

    componentWillMount() {
        this.props.dismissErrorMessage();
    }

    componentWillUpdate() {
        if (this.state.redirectToProject && this.props.error.showError && this.props.services.saveProject === false)
            this.setState({ redirectToProject: false });
    }

    render() {
        if (this.state.redirectToProject && !this.props.error.showError && this.props.services.saveProject === false)
            return <Redirect to={`/${this.name.value}`}/>;


        let errorMessage = null;
        if (this.props.error.showError) {
            errorMessage = <div className="error">
                {JSON.stringify(this.props.error.errorMessage)}
            </div>;
        }

        return <div className="createProject">
            {errorMessage}
            <label>Name: <input type="text"
                ref={(input) => this.name = input}/></label>

            <label>Description: <input type="text"
                ref={(input) => this.description = input}/></label>

            <label>Public: <input type="checkbox"
                ref={(input) => this.isPublic = input}/>
            </label>
            <button onClick={() => {
                this.props.dismissErrorMessage();
                this.setState({ redirectToProject: true });
                this.props.saveProject(this.name.value, this.description.value, this.isPublic.checked);
            }}>Save
            </button>
        </div>;
    }
}

export default connect<StateToProps, DispatchToProps, null>(
    (state) => ({ error: state.error, services: state.services }),
    {
        saveProject,
        dismissErrorMessage
    }
)(NewProject);