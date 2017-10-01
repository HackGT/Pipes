import * as React from "react";
import { Link } from 'react-router-dom';
import { Profile } from '../../reducers/profile';
import { Project } from '../../reducers/projects';


require("./ProjectSettings.scss");

interface ProjectSettingsProps {
    show: boolean,
    project: Project,
    onCloseButtonClicked: () => void,
    onDeleteButtonClicked: () => void,
    onAddAPIKeyClicked: (project: string, label: string) => void,
    onDeleteAPIKeyClicked: (project: string, label: string) => void,
    users?: Profile[],
}

export default class ProjectSettings extends React.Component<ProjectSettingsProps, null> {
    input: HTMLInputElement;

    render() {
        if (this.props.show) {

            let usersElement = null;
            if (this.props.project.isPublic) {
                usersElement = <div>
                    <div><span className="bold">Visibility: </span> Public</div>
                </div>
            } else {
                usersElement = <div>
                    <div><span className="bold">Visibility: </span> Private</div>
                    <h3>Users</h3>
                    <div>
                        {this.props.users.map((profile: Profile) => {
                            return profile.name;
                        })}
                    </div>
                </div>
            }

            const submitAPIKey = () => {
                this.props.onAddAPIKeyClicked(this.props.project.name, this.input.value);
                this.input.value = '';
            };

            return <div>
                <div onClick={this.props.onCloseButtonClicked} className="modal-bg"/>
                <div className="project-settings modal">
                    <h2>Settings</h2>
                    <button className="close" onClick={this.props.onCloseButtonClicked}>X</button>
                    {usersElement}
                    <h3>API Keys</h3>
                    <ul>
                        {this.props.project.keys.map((key) => (
                                <li key={key.name}>
                                    {key.name}
                                    <div className="api-key-id">id: {key.id}</div>
                                    <div className="api-key-id">secret: {key.secret}</div>
                                    <button
                                        onClick={() => this.props.onDeleteAPIKeyClicked(this.props.project.name, key.name)}>
                                        Delete
                                    </button>
                                </li>
                            )
                        )}
                        <li>
                            <input
                                type="text"
                                ref={(input) => this.input = input}
                                onSubmit={submitAPIKey}/>
                            <button
                                onClick={submitAPIKey}>
                                Add
                            </button>
                        </li>
                    </ul>

                    <button onClick={this.props.onDeleteButtonClicked}>Delete</button>
                </div>
            </div>
        }

        return null;
    }
}