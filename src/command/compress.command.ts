import { Command } from "commander";
import { get } from "lodash";
import { AbstractCommand, Input } from "@/command";

export class CompressCommand extends AbstractCommand {
  public load(program: Command): void {
    program
      .command("compress")
      .description("压缩文件")
      .option("-c, --config [config]", "配置文件", "assets.yaml")
      .option("-cr, --credential [credential]", "鉴权")
      .option("-t, --tag [tag]", "标记", "base")
      .action(async (command: Command) => {
        const config = get(command, "config");
        const tag = get(command, "tag");
        const credential = get(command, "credential");
        const inputs: Input[] = [];
        const options: Input[] = [];
        options.push({
          name: "config",
          value: config,
        });
        options.push({
          name: "tag",
          value: tag,
        });
        options.push({
          name: "credential",
          value: credential,
        });
        await this.action.handle(inputs, options);
      });
  }
}
