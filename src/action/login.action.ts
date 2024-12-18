import { get } from "lodash";
import { Input } from "@app/command";
import { Logger, api } from "@app/utils";
import { AbstractAction } from "@app/action";

export class LoginAction extends AbstractAction {
  public async handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[]
  ): Promise<void> {
    const account = options.find((o) => o.name === "account")?.value as string;
    const password = options.find((o) => o.name === "password")
      ?.value as string;
    if (!account) Logger.error("请输入账号");
    if (!password) Logger.error("请输入密码");
    Logger.info("开始登录");
    try {
      const data = await api.post("/auth/login", { account, password });
      const token = get(data, "data.token", "");
      Logger.info(`TOKEN: ********`);
      await api.post("/auth/credential", undefined, {
        headers: { authorization: `Bearer ${token}` },
      });
      Logger.info(`令牌: ********`);
      Logger.info("登录成功");
    } catch (error) {
      Logger.error("登录异常");
    }
  }
}
