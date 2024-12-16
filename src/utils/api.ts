import home from "home";
import fs from "fs";
import { HttpClient, Platform } from '@soratani-code/web-http';
import os from "os";
import md5 from "md5";
const pkg = require("../../package.json");

export function fingerprint() {
  const machine = os.machine();
  const arch = os.arch();
  const release = os.release();
  return Promise.resolve(md5(JSON.stringify({ machine, arch, release })));
}

export function getCredential() {
  const credentialPath = home.resolve("~/.samrc");
  if (!fs.existsSync(credentialPath)) return process.env.CREDENTIAL;
  return (
    process.env.CREDENTIAL ||
    fs.readFileSync(credentialPath, { encoding: "utf-8" })
  );
}

export function setCredential(value: string) {
  const credentialPath = home.resolve("~/.samrc");
  if (!fs.existsSync(credentialPath)) {
    fs.mkdirSync(credentialPath);
  }
  return fs.writeFileSync(credentialPath, value, { encoding: "utf-8" });
}

export interface IRes {
  code: number;
  message: string;
  data?: any;
}

export const api = new HttpClient({
  platform: Platform.cli,
  app: pkg.name,
  fingerprint,
  version: pkg.version,
  prefix: '/api',
  sign: '',
});
