import { get } from "lodash";
import { IAppConfig } from "./type";


export class Package {
    constructor(private readonly option: IAppConfig) {}
    private code: string = '';

    get name() {
        return get(this.option, 'info.name')
    }

    get version() {
        return get(this.option, 'info.version')
    }
    
}