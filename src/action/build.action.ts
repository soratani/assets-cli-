import { Input } from "@app/command";
import { AbstractAction } from "@app/action";
import { Logger } from "@app/utils";
import { Package } from "@app/common/file";
import Config from "@app/common/config";

export class BuildAction extends AbstractAction {
  public async handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[]
  ): Promise<void> {
    const config = options.find((o) => o.name === "config")?.value as Config;
    const app = options.find((o) => o.name === "app")?.value as string;
    try {
      Logger.info("准备打包");
      if (app) {
        const pkgs = config.apps.filter((item) => item.name == app);
        if (!pkgs.length) throw new Error("打包异常");
        await Package.buildAll(pkgs);
        return;
      }
      await Package.buildAll(config.apps);
    } catch (error) {
      Logger.error(error.message);
    }
  }
}
