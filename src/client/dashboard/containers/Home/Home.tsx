import { connect } from 'react-redux';
import * as React from "react";
import { Project } from '../../reducers/projects';
import { fetchProjects } from '../../actions/projects';
import ProjectSummary from '../../components/ProjectSummary/ProjectSummary';

interface StateToProps {
    projects: [Project]
}

interface DispatchToProps {
    fetchProjects: () => void
}

type HomeProps = StateToProps & DispatchToProps;

class Home extends React.Component<HomeProps, null> {
    componentWillMount() {
        this.props.fetchProjects();
    }

    render() {
        return <div className="home">
            <ul>
                {this.props.projects.map((project: Project) =>
                    <ProjectSummary
                        key={project.name}
                        name={project.name}
                        description={project.description}
                        isPublic={project.isPublic}/>
                )}
            </ul>
        </div>;
    }
}

export default connect<StateToProps, DispatchToProps, null>(
    (state) => ({ projects: state.projects }),
    {
        fetchProjects
    }
)(Home);