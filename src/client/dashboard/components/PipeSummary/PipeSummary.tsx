import * as React from "react";
import { Link } from 'react-router-dom';
import { Pipe } from '../../reducers/projects';

interface PipeSummaryProps {
    pipe: Pipe,
    projectName: string
}

export default class PipeSummary extends React.Component<PipeSummaryProps, null> {
    render() {
        return (
            <div className="pipe">
                <Link to={`/${this.props.projectName}/${this.props.pipe.name}`}><h2>{this.props.pipe.name}</h2></Link>
                <p>{this.props.pipe.description}</p>
            </div>
        )
    }
}