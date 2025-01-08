import { Configuration } from "webpack";
import { AbstractBuilder } from "./abstract.builder";

export class CommonBuilder extends AbstractBuilder {
    protected get config(): Configuration {
        throw new Error("Method not implemented.");
    }
    
}