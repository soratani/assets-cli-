import { Input } from "@app/command";
import { AbstractAction } from "@app/action";
import { Builder } from "@app/lib/builder";
import { ApplicationConfig, ENV } from "@app/lib/config";
// import { Package } from "@app/common/file";
// import Config from "@app/common/config";

export class BuildAction extends AbstractAction {
  public async handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[]
  ): Promise<void> {
    const env = options?.find((o) => o.name === "env")?.value as ENV;
    const app = options?.find((o) => o.name === "app")?.value as string;
    const file = options?.find((o) => o.name === "config")?.value as string;
    const config = new ApplicationConfig(file, { env });
    const builder = new Builder(config);
    builder.build(app);
    // try {
    //   Logger.info("准备打包");
    //   if (app) {
    //     const pkgs = config.apps.filter((item) => item.name == app);
    //     if (!pkgs.length) throw new Error("打包异常");
    //     await Package.buildAll(pkgs);
    //     return;
    //   }
    //   await Package.buildAll(config.apps);
    // } catch (error) {
    //   Logger.error(error.message);
    // }
  }
}
