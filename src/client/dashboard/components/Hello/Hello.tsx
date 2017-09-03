require("./Hello.scss");

import * as React from "react";

export interface HelloProps {
    compiler: string;
    framework: string;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
export class Hello extends React.Component<HelloProps, undefined> {
    render() {
        return <div>
            <a href="../logout">Log out</a>
        </div>;
    }
}