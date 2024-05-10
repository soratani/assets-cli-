import {
  INFO_PREFIX,
  IRes,
  Logger,
  api,
  createPackageHash,
  createTask,
} from "@/utils";
import FormData from "form-data";
import { createReadStream } from "fs";
import { zip } from "./compress";
import run from "../webpack/run";
import start from "../webpack/server";
import Config, { PACKAGE_TYPE, PackageInfo } from "../config";

export class Package {
  static syncType(type: PACKAGE_TYPE) {
    const map = {
      server: [PACKAGE_TYPE.H5, PACKAGE_TYPE.WEB],
      cos: [PACKAGE_TYPE.APP, PACKAGE_TYPE.TEMPLATE],
    };
    return Object.entries(map)
      .filter(([, keys]) => keys.includes(type))
      .map(([key]) => key);
  }

  static params(pkg: PackageInfo) {
    const { type, zip, name, version } = pkg;
    const formdata = new FormData();
    formdata.append("file", createReadStream(zip));
    formdata.append("code", name);
    formdata.append("version", version);
    formdata.append("type", type);
    return formdata;
  }

  static syncAll(packages: Package[]) {
    return packages.reduce((pre: Promise<IRes>, item) => {
      return pre.then(() => item.sync());
    }, Promise.resolve({ code: 500, message: "" }));
  }

  static buildAll(packages: Package[]) {
    return packages.reduce((pre: Promise<IRes>, item) => {
      return pre.then(() => item.build());
    }, Promise.resolve({ code: 500, message: "" }));
  }

  static startAll(packages: Package[]) {
    return packages.reduce((pre: Promise<IRes>, item) => {
      return pre.then(() => item.start());
    }, Promise.resolve({ code: 500, message: "" }));
  }

  constructor(
    private readonly option: PackageInfo,
    private readonly config: Config,
    private readonly credential: string
  ) {
    this.hash = this.hash.bind(this);
    this.compress = this.compress.bind(this);
    this.sync = this.sync.bind(this);
  }

  get name() {
    return this.option.name;
  }

  get version() {
    return this.option.version;
  }

  hash() {
    return createPackageHash(this.option.output);
  }

  async compress() {
    try {
      const hash = await this.hash();
      return await zip({ ...this.option, hash });
    } catch (error) {
      Logger.error(`${this.option.name}压缩失败`);
      return undefined;
    }
  }

  async sync() {
    const pkg = await this.compress();
    if (!pkg) return { code: 500, message: "" };
    const { name, version, type } = pkg;
    const URL = `/package/add_package`;
    const params = Package.params(pkg);
    const config = {
      headers: { ...params.getHeaders(), credential: this.credential },
    };
    const task = createTask(
      "bouncingBar",
      `\n${INFO_PREFIX}`,
      Logger.baseText(`上传中 ${type}:${name}-${version}`)
    );
    Logger.info(`准备上传 ${type} ${name}-${version}`);
    task.start();
    return api
      .post<any, IRes>(URL, params, config)
      .then((res) => {
        task.succeed(Logger.infoText(`上传完成 ${type}:${name}-${version}`));
        return res;
      })
      .catch(() => {
        task.fail(Logger.errorText(`上传失败 ${type}:${name}-${version}`));
        return { code: 500, message: "" };
      });
  }

  async build() {
    Logger.info(
      `开始打包 ${this.option.name}:${this.option.type}-${this.option.version}`
    );
    const task = createTask(
      "dots",
      INFO_PREFIX,
      `打包中 ${this.option.type}:${this.option.name}-${this.option.version}`
    );
    try {
      task.start();
      await run(this.option, this.config);
      task.succeed(
        `打包成功 ${this.option.type}:${this.option.name}-${this.option.version}`
      );
    } catch (error) {
      console.log(error);
      task.fail(
        `打包失败 ${this.option.type}:${this.option.name}-${this.option.version}`
      );
    }
  }

  async start() {
    Logger.info(
      `开始启动 ${this.option.name}:${this.option.type}-${this.option.version}`
    );
    const task = createTask(
      "dots",
      INFO_PREFIX,
      `启动中 ${this.option.type}:${this.option.name}-${this.option.version}`
    );
    try {
      task.start();
      await start(this.option, this.config);
      task.succeed(
        `启动成功 ${this.option.type}:${this.option.name}-${this.option.version}`
      );
    } catch (error) {
      task.fail(
        `启动失败 ${this.option.type}:${this.option.name}-${this.option.version}`
      );
    }
  }
}
