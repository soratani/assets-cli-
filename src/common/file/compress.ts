import { createWriteStream, existsSync, mkdirSync } from "fs";
import archiver from "archiver";
import { join } from "path";
import { Logger } from "@/utils/logger";
import { ApplicationInfo, packageTypeMap } from "../config";

export function zip(options: ApplicationInfo) {
  const { name, version, hash, output, zip } = options;
  if (!existsSync(zip)) mkdirSync(zip, { recursive: true });
  const outputPath = join(zip, `${hash}.zip`);
  const outputStream = createWriteStream(outputPath);
  Logger.info("开始压缩");
  Logger.info(`名称:${name}`);
  Logger.info(`版本:${version}`);
  Logger.info(`hash:${hash}`);
  return new Promise<ApplicationInfo>((resolve) => {
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });
    outputStream.on("close", function () {
      Logger.info(`bytes:${archive.pointer()}`);
      resolve({ ...options, zip: outputPath });
    });
    outputStream.on("end", function () {
      Logger.info(`${name}_${version}_${hash}.zip`);
    });
    archive.on("warning", function (err) {
      Logger.wran(`${name}_${version}_${hash}.zip压缩异常`);
      if (err.code === "ENOENT") {
        resolve(undefined);
      } else {
        resolve(undefined);
      }
    });

    archive.on("error", function (err) {
      Logger.wran(`${name}_${version}_${hash}.zip压缩异常`);
      resolve(undefined);
    });
    archive.pipe(outputStream);
    return archive.directory(output, false).finalize();
  });
}
