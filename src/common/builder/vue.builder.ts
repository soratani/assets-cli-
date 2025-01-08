import { Configuration } from "webpack";
import { AbstractBuilder } from "./abstract.builder";

export class VueBuilder extends AbstractBuilder {
    protected get config(): Configuration {
        return {}
    }
}