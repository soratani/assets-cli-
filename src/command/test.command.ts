import { Command } from "commander";
import { AbstractCommand } from "./abstract.command";
import { ApplicationConfig } from "@app/common/config/config";
import { get } from "lodash";

export class TestCommand extends AbstractCommand {
    public load(program: Command): void {
        program
            .command('test <app>')
            .description("测试")
            .option("-e, --env [env]", "启动环境:[test,production,development]", "development")
            .option("-c, --config [config]", "配置文件", "sam.yaml")
            .action(async (app: string, command: Command) => {
                const file = get(command, "config");
                const env = get(command, "env");
                const config = new ApplicationConfig(file, { env });
                const instance = config.find('app', 'admin')
                instance.load();
            })

    }
}