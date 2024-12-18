import home from "home";
import fs from "fs";
import { HttpClient, Platform, Storage } from '@soratani-code/web-http';
import os from "os";
import md5 from "md5";
import dotenv from 'dotenv';
import { readConfig, writeConfig } from "./utils";
const pkg = require("../../package.json");

export function fingerprint() {
  const machine = os.machine();
  const arch = os.arch();
  const release = os.release();
  return Promise.resolve(md5(JSON.stringify({ machine, arch, release })));
}

class HttpStorage extends Storage {
  get(key: string, value?: any) {
    const conf = readConfig();
    if (!conf || !conf[key]) return value;
    return conf[key];
  }
  set(key: string, value: any) {
    writeConfig(key, value);
  }
}

export const storage = new HttpStorage();

export const api = new HttpClient({
  storage,
  platform: Platform.cli,
  app: pkg.name,
  fingerprint,
  version: pkg.version,
  prefix: 'http://localhost:3000/api',
  sign: '',
});
