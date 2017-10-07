import { OutputPlugin } from '../Output';

type pluginDependencies = {

}

export class Twitter extends OutputPlugin {
    public propagate(): Promise<string | string[]> {
        return undefined;
    }

    public getNodeName(): string {
        return undefined;
    }

    public buildDependencies(iterable, value, key) {
    }

    public isSatisfied(): boolean {
        return undefined;
    }
}