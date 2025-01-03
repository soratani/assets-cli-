import { Command } from "commander";
import { get } from "lodash";
import { AbstractCommand, Input } from "@app/command";

export class BuildCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command("build <app>")
      .description("打包")
      .option(
        "-e, --env [env]",
        "打包环境:[test,production,development]",
        "production"
      )
      .option("-c, --config [config]", "配置文件", "config.yaml")
      .action(async (app: string, command: Command) => {
        const inputs: Input[] = [];
        const options: Input[] = [];
        const file = get(command, "config", '');
        const env = get(command, "env");
        options.push({
          name: "app",
          value: app,
        });
        options.push({
          name: "env",
          value: env,
        });
        options.push({
          name: "config",
          value: file,
        });
        await this.action.handle(inputs, options);
      });
  }
}
