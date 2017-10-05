import * as React from "react";
import { Link } from 'react-router-dom';

interface ProjectSummaryProps {
    name: string,
    description: string,
    isPublic: boolean
}

export default class ProjectSummary extends React.Component<ProjectSummaryProps, null> {
    render() {
        let privateTag = null;
        if(this.props.isPublic) {
            privateTag = '';
        } else {
            privateTag = <span>Private</span>
        }

        return <div className="project-summary">
            <Link to={`/${this.props.name}`}><h3>{this.props.name} {privateTag}</h3></Link>
            <p>{this.props.description}</p>
        </div>;
    }
}