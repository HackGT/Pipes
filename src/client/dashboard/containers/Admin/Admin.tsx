import { connect } from 'react-redux';
import * as React from "react";
import { Redirect } from 'react-router-dom';
import { dismissErrorMessage } from '../../actions/error';
import { Profile, UserClass } from '../../reducers/profile';
import { fetchUsers, updateUser } from '../../actions/users';
import User from '../../components/User/User';

type StateToProps = {
    error: {
        showError: boolean,
        errorMessage: boolean
    },
    services: { [name: string]: boolean },
    profile: Profile,
    users: [Profile]
}

type DispatchToProps = {
    dismissErrorMessage: () => void,
    fetchUsers: () => void,
    updateUser: (id: string, userClass: number) => void
}

type Props = StateToProps & DispatchToProps;

type State = {}

class Admin extends React.Component<Props, State> {
    private name: HTMLInputElement;
    private description: HTMLInputElement;
    private isPublic: HTMLInputElement;

    componentWillMount() {
        if (this.props.profile.userClass === UserClass.Admin) {
            this.props.fetchUsers()
        }
    }

    render() {
        if (this.props.profile.userClass !== UserClass.Admin) {
            return <Redirect to={'/'}/>;
        }

        return (
            <div>
                {this.props.users.map((user: Profile) => {
                    return <User key={user.id} user={user}
                        isUser={user.id === this.props.profile.id}
                        updateUser={this.props.updateUser}/>
                })}
            </div>
        );
    }
}

export default connect<StateToProps, DispatchToProps, null>(
    (state) => ({
        error: state.error,
        services: state.services,
        profile: state.profile,
        users: state.users
    }),
    {
        dismissErrorMessage,
        fetchUsers,
        updateUser
    }
)(Admin);