import { filter, get, pick, reduce } from "lodash";
import { api, Logger } from "@app/utils";
import archiver from "archiver";
import { join } from "path";
import crypto from "crypto";
import { glob } from "glob";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { ENV, FindType, IAppConfig } from "./type";
import { ApplicationConfig } from "./config";
import { Package } from "./package";


export class Application {
    constructor(private readonly config: ApplicationConfig, private readonly option: IAppConfig) { }
    private code: string = '';

    private findDepsFromType(type: FindType) {
        const deps = Object.keys(get(this.option, 'info.dependencies', {}));
        const pkgs = filter(deps.map((dep) => this.config.find(type, dep)), Boolean) as unknown as (Package | Application);
        return reduce(pkgs, (prev, item: (Package | Application)) => {
            prev[item.name] = join(item.path, item.entry);
            return prev;
        }, {});
    }
    get name() {
        return get(this.option, 'info.name')
    }
    get version() {
        return get(this.option, 'info.version')
    }
    get exports(): Record<string, string> {
        const data = get(this.option, 'info.exports', {});
        return reduce(Object.keys(data), (prev, key) => {
            prev[join(this.name, key)] = join(this.path, data[key]);
            return prev;
        }, {});
    }
    get entry() {
        return get(this.option, 'info.root');
    }
    get path() {
        return get(this.option, 'path', '');
    }
    get hash() {
        return get(this.option, 'info.hash');
    }
    get output() {
        return join(process.cwd(), 'dist/app', this.name);
    }
    get zip() {
        return join(process.cwd(), 'zip/app', this.name);
    }
    get public() {
        return join(this.path, 'public');
    }
    get alias() {
        const deps = Object.keys(get(this.option, 'info.dependencies', {}));
        const pkgs = reduce(filter(deps.map((dep) => this.config.find('package', dep)), Boolean), (prev, item: Package) => {
            prev[item.name] = join(item.path, item.entry);
            return prev;
        }, {});
        if ([ENV.development].includes(this.config.env!)) {

        }
        return pkgs
    }

    private createHash(dir: string) {
        const hash = crypto.createHash("sha256");
        return new Promise<string>((resolve, reject) => {
            glob("**/*", { cwd: dir, nodir: true }, (err, files) => {
                if (err) {
                    return reject(null);
                }
                files.forEach((file) => {
                    const filePath = join(dir, file);
                    const data = readFileSync(filePath);
                    hash.setEncoding("hex");
                    hash.update(data);
                });
                const sha256 = hash.digest("hex");
                resolve(sha256);
                return;
            });
        });
    }

    async load() {
        const { name, version } = pick(this.option.info, ['name', 'version'])
        api.get(`/cli/query/modules/app`).catch((e) => {
            console.log(e);
        })
        Logger.info("加载应用")
        // const {  } = await api.get('/', { headers: { credential: this.option.credential }, params: { name, version } })
    }

    /**
     * 压缩
     * @returns 
     */
    async compress() {
        if (!existsSync(this.output)) mkdirSync(this.output, { recursive: true });
        if (!existsSync(this.zip)) mkdirSync(this.zip, { recursive: true });
        const hash = await this.createHash(this.output);
        const zipPath = join(this.zip, `${hash}.zip`);
        if (hash === this.hash && existsSync(zipPath)) {
            return zipPath;
        }
        const packagePath = join(this.option.path, 'package.json');
        const packageInfo = this.option.info;
        const zipStream = createWriteStream(zipPath);
        return new Promise<string>((resolve, reject) => {
            const archive = archiver("zip", {
                zlib: { level: 9 }, // Sets the compression level.
            });
            zipStream.on("close", function () {
                writeFileSync(packagePath, JSON.stringify({ ...packageInfo, hash }));
                resolve(zipPath);
            });
            archive.on("warning", function (err) {
                if (err.code === "ENOENT") {
                    reject(undefined);
                } else {
                    reject(undefined);
                }
            });

            archive.on("error", function (err) {
                reject(undefined);
            });
            archive.pipe(zipStream);
            archive.directory(this.output, false).finalize();
        });
    }
}