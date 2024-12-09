import { Input } from "@app/command";
import { Logger } from "@app/utils";
import { AbstractAction } from "./abstract.action";


export class TestAction extends AbstractAction {
    public async handle(inputs?: Input[], options?: Input[], extraFlags?: string[]): Promise<void> {
        Logger.info('s');
    }
}