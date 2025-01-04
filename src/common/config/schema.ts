import * as joi from "joi";

const proxySchema = joi.object().keys({
  path: joi.string().required(),
  target: joi.string().required(),
});

export default joi.object({
  apps: joi.string(),
  packages: joi.string(),
}).default({});
