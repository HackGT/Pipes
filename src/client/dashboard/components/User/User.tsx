import * as React from "react";
import { Redirect } from 'react-router';
import { Profile, UserClass } from '../../reducers/profile';

type Props = {
    user: Profile
}

type State = {}

export default class User extends React.Component<Props, State> {
    render() {
        return <div>
            <p><span className="bold">Name </span>{this.props.user.name}</p>
            <p><span className="bold">Email </span>{this.props.user.email}</p>
            <p><span className="bold">Class </span>{UserClass[this.props.user.userClass]}</p>
        </div>
    }
}