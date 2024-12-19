import { HttpLogger } from '@soratani-code/web-http';
import colors from 'chalk';

export const ERROR_PREFIX = (...text: string[]) => {
  return `${TIME(` ${time()} `)}${colors.bgRgb(210, 0, 75).bold.rgb(0, 0, 0)(" ERROR ", ...text)}`
};
export const INFO_PREFIX = (...text: string[]) => {
  return `${TIME(` ${time()} `)}${colors.bgRgb(35, 187, 40).bold.rgb(0, 0, 0)(" INFO ", ...text)}`
};
export const WRAN_PREFIX = (...text: string[]) => {
  return `${TIME(` ${time()} `)}${colors.bgRgb(208, 211, 45).bold.rgb(0, 0, 0)(" WRAN ", ...text)}`
};
export const TIME = colors.bgBlack.bold.rgb(255, 255, 255);

function time() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 月份从 0 开始，所以要加 1
  const day = now.getDate();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export class Logger extends HttpLogger {
  log(label: string, message: string): void {
    console.log(`${INFO_PREFIX()}`, label, message);
  }
  info(label: string, ...message: any[]): void {
    console.log(`${INFO_PREFIX()}`, label, ...message);
  }
  warn(label: string, ...message: any[]): void {
    console.log(`${WRAN_PREFIX()}`, label, ...message);
  }
  error(label: string, ...message: any[]): void {
    console.log('>>>>>')
    console.log(`${ERROR_PREFIX()}`, label, ...message);
  }
  static error(message: string, ...args: any[]) {
    console.log(`${ERROR_PREFIX()} ${colors.redBright(message)}`, ...args);
    process.exit(1);
  }
  static info(message: string, ...args: any[]) {
    console.log(`${INFO_PREFIX()} ${colors.green(message)}`, ...args);
  }
  static wran(message: string, ...args: any[]) {
    console.log(`${WRAN_PREFIX()} ${colors.yellow(message)}`, ...args);
  }
  static baseText(message: string) {
    return colors.blue(message);
  }
  static errorText(message: string) {
    return colors.redBright(message);
  }
  static infoText(message: string) {
    return colors.green(message);
  }
  static wranText(message: string) {
    return colors.yellow(message);
  }
}