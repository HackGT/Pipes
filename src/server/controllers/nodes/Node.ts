export interface INode {
    readonly isOutput?: boolean,
    propagate(): any,
}

export interface IOutput extends INode {
    inputs: { [key: string]: INode },
    getServiceName():string
}

export interface ITransformer extends INode {
    inputs: { [key: string]: INode }
}