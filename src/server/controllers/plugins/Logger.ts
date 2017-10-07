import { OutputPlugin } from '../Output';

type pluginDependencies = {
    data: string
}

export class Logger extends OutputPlugin {
    private dependencies: pluginDependencies = {
        data: null
    };
    private shouldIter = false;

    public getNodeName(): string {
        return 'Logger';
    }

    public async propagate(): Promise<string> {
        if(this.shouldIter) {
            for(let i = 0; i < this.dependencies.data.length; i++) {
                console.log(`[${this.getNodeName()}[${i}]]: ${this.dependencies.data[i]}`);
            }
        } else {
            console.log(`[${this.getNodeName()}]: ${this.dependencies.data}`);
        }
        return 'success';
    }

    public buildDependencies(iterable, value, key) {
        if (key === 'data'){
            this.dependencies.data = value;
            this.shouldIter = iterable;
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.data !== null;
    }
}