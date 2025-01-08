import { get } from "lodash";
import { IAppConfig } from "./type";
import { join } from "path";


export class Package {
    constructor(private readonly option: IAppConfig) { }

    get name() {
        return get(this.option, 'info.name')
    }

    get version() {
        return get(this.option, 'info.version')
    }

    get exports(): Record<string, string> {
        return get(this.option, 'info.exports', {});
    }
    get entry() {
        return get(this.option, 'info.entry');
    }
    get path() {
        return get(this.option, 'path', '');
    }

    get output() {
        return join(process.cwd(), 'libs', this.name);
    }
}