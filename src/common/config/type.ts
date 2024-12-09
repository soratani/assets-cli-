export type IAppPath = string;
export type IPackagePath = string;
export type IAssetsPath = string;
export type IAppConfig = {
    path: string;
    package: string;
    env: ENV;
    credential?: string;
    info: Record<string, any>;
}

export type IConfig = {
    apps: IAppPath;
    packages: IPackagePath;
    assets: IAssetsPath,
}

export enum ENV {
    test = "test",
    production = "production",
    development = "development",
}

export interface IConfigOption {
    env?: ENV;
    credential?: string;
}