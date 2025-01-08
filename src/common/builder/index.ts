import { ApplicationConfig, FindType, Framework } from "../config";
import { AngularBuilder } from "./angular.builder";
import { CommonBuilder } from "./common.builder";
import { ReactBuilder } from "./react.builder";
import { VueBuilder } from "./vue.builder";


export class Builder {
    static create(
        type: FindType,
        app: string,
        options: ApplicationConfig
    ) {
        switch (options.framework) {
            case Framework.react:
                return new ReactBuilder(type, app, options);
            case Framework.vue:
                return new VueBuilder(type, app, options);
            case Framework.angular:
                return new AngularBuilder(type, app, options);
            case Framework.common:
                return new CommonBuilder(type, app, options);
            default:
                return new CommonBuilder(type, app, options);
        }
    }
}