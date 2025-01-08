import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { extname, join } from "path";
import * as yaml from "yaml";
import { filter, get, map, mergeWith, pick } from "lodash";
import { api, Logger } from "@app/utils";
import schema from "./schema";
import { ENV, FindType, Framework, IAppConfig, IConfig, IConfigOption } from "./type";
import { Application } from "./application";
import { Package } from "./package";


export const defaultConfig: IConfig = {
    apps: './apps',
    packages: './packages',
    assets: './assets',
};

export const frameworks: Record<Framework, string[]> = {
    [Framework.react]: ['react', 'react-dom', 'react-router-dom'],
    [Framework.vue]: ['vue', 'vue-router'],
    [Framework.angular]: ['angular'],
    [Framework.common]: []
}

type FindResult<T extends FindType> = T extends "app" ? Application : Package;


export class ApplicationConfig {
    constructor(private readonly file: string, private readonly options: IConfigOption) {
        this.data = this.parseConfigFile(join(process.cwd(), this.file));
        this.apps = this.generateApps(this.data.apps, 'app') as Application[];
        this.packages = [];
        this.parseRoot();
    }
    private info: Record<string, any> = {};
    private data!: IConfig;
    private apps: Application[];
    private packages: Package[];

    private isYaml(file: string) {
        const name = extname(file);
        return [".yaml", ".yml"].includes(name);
    }

    private parseConfigFile(file: string): IConfig {
        if (!file) return defaultConfig;
        const hasStatus = existsSync(file);
        if (!hasStatus) return defaultConfig;
        const stat = statSync(file);
        if (!stat.isFile()) return defaultConfig;
        if (!this.isYaml(file)) return defaultConfig;
        const data = readFileSync(file).toString();
        const yamlData = yaml.parse(data);
        const { value, error } = schema.validate(yamlData, {
          convert: false,
        });
        const message = get(error, "details.0.message");
        if (message) Logger.error(message);
        return mergeWith(defaultConfig, value);
    }

    private parsePackage(file: string) {
        try {
            return JSON.parse(readFileSync(file).toString());
        } catch (error) {
            return undefined;
        }
    }

    private generateApps<T extends FindType>(apps: string, type: FindType): FindResult<T>[] {
        const env = get(this.options, 'env', ENV.development);
        const credential = get(this.options, 'credential');
        const apps_path = join(process.cwd(), apps);
        const apps_config = map<string, IAppConfig>(readdirSync(apps_path), (dir) => {
            return {
                path: join(apps_path, dir),
                package: join(apps_path, dir, 'package.json'),
                info: {},
                env,
                credential
            }
        });
        const filter_apps = filter(apps_config, (app) => existsSync(app.package));
        return map(filter_apps, (app) => {
            const data = this.parsePackage(app.package);
            if(!data) return undefined;
            app.info = data;
            if (type)
            return this.generateApp(app);
        }).filter(Boolean) as FindResult<T>[];
    }

    private generateApp(app: IAppConfig) {
        return new Application(this, app);
    }

    private parseRoot() {
        const pkg_path = join(process.cwd(), 'package.json');
        const pkg = this.parsePackage(pkg_path);
        if (!pkg) return;
        this.info = pkg;
    }

    get framework() {
        const dependencies = get(this.info, 'dependencies', {});
        const devDependencies = get(this.info, 'devDependencies', {});
        const deps = [...Object.keys(dependencies), ...Object.keys(devDependencies)];
        const [frame] = Object.entries(frameworks).find((item) => item[1].some((k) => deps.includes(k))) as [Framework, string[]];
        return frame;
    }

    get env() {
        return this.options.env;
    }

    get type() {
        return this.options.type;
    }

    get name() {
        return get(this.info, 'name');
    }

    get version() {
        return get(this.info, 'version');
    }

    /**
     * 异步加载app
     */
    async imports() {
        const params = pick(this,['name', 'version', 'env'])
        const data = await api.get('/', { params });
    }

    find<T extends FindType>(type: T, name: string): FindResult<T> {
        if (type === 'app') return this.apps.find((item) => item.name === name) as FindResult<T>;
        return this.packages.find((item) => item.name === name) as FindResult<T>;
    }
}