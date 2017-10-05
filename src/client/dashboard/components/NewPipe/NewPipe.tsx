import * as React from "react";
import { Redirect } from 'react-router';

require('./NewPipe.scss');

type Props = {
    show: boolean,
    projectName: string,
    onCloseButtonClicked: () => void,
    savePipe: (projectName: string, name: string, description: string) => void,
    error: {
        showError: boolean,
        errorMessage: string
    },
    saving: boolean,
    dismissErrorMessage: () => void
}

type State = {
    redirectToPipe: boolean
}

export default class NewPipe extends React.Component<Props, State> {
    private name: HTMLInputElement;
    private description: HTMLInputElement;

    constructor() {
        super();
        this.state = {
            redirectToPipe: false
        }
    }

    componentWillMount() {
        this.props.dismissErrorMessage();
    }

    componentWillUpdate() {
        if (this.state.redirectToPipe && this.props.error.showError && this.props.saving === false)
            this.setState({ redirectToPipe: false });
    }

    render() {
        if (this.props.show) {
            console.log(this.state.redirectToPipe, !this.props.error.showError, this.props.saving);
            if (this.state.redirectToPipe && !this.props.error.showError && this.props.saving === false)
                return <Redirect to={`/${this.props.projectName}/${this.name.value}`}/>;


            let errorMessage = null;
            if (this.props.error.showError) {
                errorMessage = <div className="error">
                    {this.props.error.errorMessage}
                </div>;
            }

            return <div>
                <div onClick={this.props.onCloseButtonClicked} className="modal-bg"/>
                <div className="new-pipe modal">
                    <div className="title">
                        <h2>Create A New Pipe</h2>
                        <button className="close" onClick={this.props.onCloseButtonClicked}>X
                        </button>

                        {errorMessage}

                        <label>Name: <input type="text"
                            ref={(input) => this.name = input}/></label>

                        <label>Description: <input type="text"
                            ref={(input) => this.description = input}/></label>

                        <button
                            onClick={() => {
                                this.props.dismissErrorMessage();
                                this.setState({ redirectToPipe: true });
                                this.props.savePipe(this.props.projectName, this.name.value, this.description.value)
                            }}>
                            Create
                        </button>
                    </div>
                </div>
            </div>
        }

        return null;
    }
}