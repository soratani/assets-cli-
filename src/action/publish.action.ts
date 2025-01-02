import { Input } from "@app/command";
import { AbstractAction } from "@app/action";

export class PublishAction extends AbstractAction {
  public async handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[]
  ): Promise<void> {

  }
}
