#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";

export class Whitelister {
  private static readonly WHITELISTED_SECTIONS = {
    phaseOne: [
      "B3-3.1-08.html",
      "B2-1.3-02.html",
      "B3-4.1-01.html",
      "B5-1-02.html",
      "B3-5.1-01.html",
    ],
  };

  private sourceFolder: string;

  constructor(sourceFolder: string) {
    this.sourceFolder = sourceFolder;
  }

  /**
   * Copies only whitelisted files from the source folder to a new folder called "whitelisted"
   * @returns The absolute path of the created folder
   */
  public async copyFolder(): Promise<string> {
    try {
      if (!fs.existsSync(this.sourceFolder)) {
        throw new Error(`Source folder does not exist: ${this.sourceFolder}`);
      }

      const stats = fs.statSync(this.sourceFolder);
      if (!stats.isDirectory()) {
        throw new Error(`Source path is not a directory: ${this.sourceFolder}`);
      }

      const parentDir = path.dirname(this.sourceFolder);
      const destFolder = path.join(parentDir, "whitelisted");

      await fs.promises.mkdir(destFolder, { recursive: true });
      await this.filterFiles(this.sourceFolder, destFolder);

      return path.resolve(destFolder);
    } catch (error) {
      throw new Error(`Failed to copy folder: ${error}`);
    }
  }

  /**
   * Filters files moving between folders based on whitelist
   */
  private async filterFiles(
    source: string,
    destination: string
  ): Promise<void> {
    const allFiles = await fs.promises.readdir(source, {
      withFileTypes: false,
      encoding: "utf8",
    });
    await Promise.all(
      allFiles
        .filter((filename) =>
          Whitelister.WHITELISTED_SECTIONS.phaseOne.includes(filename)
        )
        .map((filename) => {
          const sourcePath = path.join(source, filename);
          const destPath = path.join(destination, filename);
          return fs.promises.copyFile(sourcePath, destPath);
        })
    );
  }
}

const main = async () => {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Usage: whitelist <source-folder-path>");
    console.error("Example: whitelist /path/to/downloaded/files");
    process.exit(1);
  }

  const sourcePath = args[0];

  const whitelister = new Whitelister(sourcePath);
  const outputPath = await whitelister.copyFolder();

  console.log(outputPath);

  process.exit(0);
};

if (require.main === module) {
  void main();
}
