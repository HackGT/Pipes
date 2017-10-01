import * as React from "react";
import { UserClass } from '../../reducers/profile';

type props = {
    name?: string,
    combolist: any[],
    defaultValue: string
}

type state = {
    selectedValue: string
};

export default class Combobox extends React.Component<props,state> {
    constructor(props: props) {
        super(props);
        this.state = {selectedValue: props.defaultValue};
        this.getValue.bind(this);
    }

    render() {
        return (
            <div className="combobox-wrapper">
                <select name={this.props.name} defaultValue={this.props.defaultValue} onChange={(e) => this.setState({selectedValue: e.target.value})}>
                    {
                        this.props.combolist.map(function(item, i) {
                            return (
                                <option key={i} value={item}>
                                    {item}
                                </option>
                            )
                        })
                    }
                </select>
            </div>
        )
    }

    getValue() {
        return this.state.selectedValue;
    }
}