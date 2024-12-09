import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { extname, join } from "path";
import * as yaml from "yaml";
import { filter, get, map, mergeWith } from "lodash";
import { Logger } from "@app/utils";
import schema from "./schema";
import { ENV, IAppConfig, IConfig, IConfigOption } from "./type";
import { Application } from "./application";
import { Package } from "./package";


export const defaultConfig: IConfig = {
    apps: './apps',
    packages: './packages',
    assets: './assets',
};

type FindType = "app" | "package";
type FindResult<T extends FindType> = T extends "app" ? Application : Package;


export class ApplicationConfig {
    constructor(private readonly file: string, private readonly options: IConfigOption) {
        this.data = this.parseConfigFile(join(process.cwd(), this.file));
        this.apps = this.generateApps(this.data.apps);
    }

    private data!: IConfig;
    private apps: Application[];

    private isYaml(file: string) {
        const name = extname(file);
        return [".yaml", ".yml"].includes(name);
    }

    private parseConfigFile(file: string): IConfig {
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

    private generateApps(apps: string) {
        function parsePackage(file: string) {
            try {
                return JSON.parse(readFileSync(file).toString());
            } catch (error) {
                return undefined;
            }
        }
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
            const data = parsePackage(app.package);
            if(!data) return undefined;
            app.info = data;
            return this.generateApp(app);
        }).filter(Boolean);
    }

    private generateApp(app: IAppConfig) {
        return new Application(app);
    }

    find<T extends FindType>(type: T, name: string): FindResult<T> {
        if (type === 'app') return this.apps.find((item) => item.name === name) as FindResult<T>;
    }
}