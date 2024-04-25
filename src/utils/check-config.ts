import { extname } from "path";
import { get } from "lodash";
import Joi, * as joi from "joi";
import { Logger } from "../ui/logger";

const IpSchema = joi.object().keys({
  host: joi.string().required(),
  port: joi.alternatives().try(joi.string(), joi.number()).required(),
});
const PkgSchema = joi.object().keys({
  type: Joi.string().valid("package", "app").default("app"),
  input: joi.string().required(),
  output: joi.string().required(),
});

const AssetsSchema = joi.object().keys({
  type: joi
    .array()
    .items(joi.string().valid("cos", "ssh").default("ssh"))
    .required(),
  local: joi.string().required(),
  remote: joi.string().required(),
});

const CosSchema = joi.object().keys({
  type: joi.string().valid("tencent", "ali").default("tencent"),
  region: joi.string().required(),
  bucket: joi.string().required(),
});

const schema = joi.object({
  package: PkgSchema,
  ssh: joi.array().ordered(IpSchema),
  cos: CosSchema,
  assets: joi.array().items(AssetsSchema).required(),
});

interface IP {
  host: string;
  port: string | number;
}

export function isYaml(file: string) {
  const name = extname(file);
  return [".yaml", ".yml"].includes(name);
}

export function check(config) {
  const { value, error } = schema.validate(config, {
    convert: false,
  });
  const message = get(error, "details.0.message");
  if (message) Logger.error(message);
  return value;
}
