import { get } from "lodash";
import { IAppConfig } from "./type";


export class Package {
    constructor(private readonly option: IAppConfig) {}

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
}