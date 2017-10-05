import * as React from "react";
import { Redirect } from 'react-router';
import { Profile, UserClass } from '../../reducers/profile';
import Combobox from '../Combobox/Combobox';

type Props = {
    user: Profile,
    isUser: boolean,
    updateUser: (id: string, userClass: number)=>void
}

type State = {}

export default class User extends React.Component<Props, State> {
    box: Combobox;

    render() {
        if(this.props.isUser) {
            return <div>
                <p><span className="bold">Name </span>{this.props.user.name}</p>
                <p><span className="bold">Email </span>{this.props.user.email}</p>
                <p><span className="bold">Class </span>{UserClass[this.props.user.userClass]}</p>
            </div>
        }

        const classes = [
            UserClass[0],
            UserClass[1],
            UserClass[2],
            UserClass[3],
        ];
        return <div>
            <p><span className="bold">Name </span>{this.props.user.name}</p>
            <p><span className="bold">Email </span>{this.props.user.email}</p>
            <div>
                <span className="bold">Class </span>
                <Combobox
                    combolist={classes}
                    defaultValue={UserClass[this.props.user.userClass]}
                    ref={(input) => this.box = input}/>
                <button onClick={()=>this.props.updateUser(this.props.user.id, classes.indexOf(this.box.getValue()))}>Save</button>
            </div>
        </div>
    }
}