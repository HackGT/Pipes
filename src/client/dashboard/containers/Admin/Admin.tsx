import { connect } from 'react-redux';
import * as React from "react";
import { Redirect } from 'react-router-dom';
import { dismissErrorMessage } from '../../actions/error';
import { Profile, UserClass } from '../../reducers/profile';
import { fetchUsers } from '../../actions/users';
import User from '../../components/User/User';

type StateToProps = {
    error: {
        showError: boolean,
        errorMessage: boolean
    },
    services: { [name: string]: boolean },
    isAdmin: boolean,
    users: [Profile]
}

type DispatchToProps = {
    dismissErrorMessage: () => void,
    fetchUsers: () => void
}

type Props = StateToProps & DispatchToProps;

type State = {}

class Admin extends React.Component<Props, State> {
    private name: HTMLInputElement;
    private description: HTMLInputElement;
    private isPublic: HTMLInputElement;

    componentWillMount() {
        if (this.props.isAdmin) {
            this.props.fetchUsers()
        }
    }

    render() {
        if (!this.props.isAdmin) {
            return <Redirect to={'/'}/>;
        }

        return (
            <div>
                {this.props.users.map((user: Profile) => {
                    return <User key={user.id} user={user}/>
                })}
            </div>
        );
    }
}

export default connect<StateToProps, DispatchToProps, null>(
    (state) => ({
        error: state.error,
        services: state.services,
        isAdmin: state.profile.userClass === UserClass.Admin,
        users: state.users
    }),
    {
        dismissErrorMessage,
        fetchUsers
    }
)(Admin);