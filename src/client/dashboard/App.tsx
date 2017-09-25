import { Component } from 'react';
import * as React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import Home from './containers/Home/Home';
import Project from './containers/Project/Project';
import NewProject from './containers/NewProject/NewProject';
import Pipe from './containers/Pipe/Pipe';
import Admin from './containers/Admin/Admin';
import { connect } from 'react-redux';
import { fetchProfile } from './actions/profile';

require('./App.scss');

type DispatchToProps = {
    fetchProfile: () => void
}

class App extends Component<DispatchToProps, null> {
    componentWillMount() {
        this.props.fetchProfile();
    }

    render() {
        return (
            // TODO: Fix Route Casts
            <Router basename="/dashboard">
                <div>
                    <ul className="nav">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/admin">Admin</Link></li>
                        <li><Link to="/new">Create Project</Link></li>
                    </ul>

                    <Switch>
                        <Route exact path="/" component={Home as any}/>
                        <Route exact path="/new" component={NewProject as any}/>
                        <Route exact path="/admin" component={Admin as any}/>
                        <Route path="/:id/:pipe" component={Pipe as any}/>
                        <Route path="/:id" component={Project as any}/>
                    </Switch>

                </div>
            </Router>
        );
    }
}

export default connect<null, DispatchToProps, null>(
    null,
    {
        fetchProfile
    }
)(App);