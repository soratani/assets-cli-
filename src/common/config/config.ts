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
        this.packages = this.generatePackages(this.data.packages);
    }

    private data!: IConfig;
    private apps: Application[];
    private packages: Package[];

    private isYaml(file: string) {
        const name = extname(file);
        return [".yaml", ".yml"].includes(name);
    }

    private parsePackage(file: string) {
        try {
            return JSON.parse(readFileSync(file).toString());
        } catch (error) {
            return undefined;
        }
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
        const parse = this.parsePackage;
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
            const data = parse(app.package);
            if(!data) return undefined;
            app.info = data;
            return this.generateApp(app);
        }).filter(Boolean) as Application[];
    }
    private generatePackages(pkgs: string) {
        const parse = this.parsePackage;
        const env = get(this.options, 'env', ENV.development);
        const credential = get(this.options, 'credential');
        const pkgs_path = join(process.cwd(), pkgs);
        const pkgs_config = map<string, IAppConfig>(readdirSync(pkgs_path), (dir) => {
            return {
                path: join(pkgs_path, dir),
                package: join(pkgs_path, dir, 'package.json'),
                info: {},
                env,
                credential
            }
        });
        const filter_pkgs = filter(pkgs_config, (app) => existsSync(app.package));
        return map(filter_pkgs, (app) => {
            const data = parse(app.package);
            if(!data) return undefined;
            app.info = data;
            return this.generatePackage(app);
        }).filter(Boolean) as Package[];
    }
    private generatePackage(pkg: IAppConfig) {
        return new Package(pkg);
    }

    private generateApp(app: IAppConfig) {
        return new Application(app);
    }

    find<T extends FindType>(type: T, name: string): FindResult<T> {
        if (type === 'app') return this.apps.find((item) => item.name === name) as FindResult<T>;
        return this.packages.find((item) => item.name === name) as FindResult<T>;
    }
}