import { get, pick } from "lodash";
import { IAppConfig } from "./type";
import { api, Logger } from "@app/utils";


export class Application {
    constructor(private readonly option: IAppConfig) {}
    private code: string = '';

    get name() {
        return get(this.option, 'info.name')
    }

    get version() {
        return get(this.option, 'info.version')
    }

    /**
     * 加载应用的基本信息
     * 模块信息
     */
    async load() {
        const { name, version } = pick(this.option.info, ['name', 'version'])
        Logger.info("加载应用")
        const {  } = await api.get('/', { headers: { credential: this.option.credential }, params: { name, version } })
        console.log(name, version);
    }

    async build() {

    }
}