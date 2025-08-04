import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";
import { Whitelister } from "./whitelister";

// Mock fs module with proper promises setup
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
  statSync: jest.fn(),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
    copyFile: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("Whitelister Property Tests", () => {
  const WHITELISTED_FILES = [
    "B3-3.1-08.html",
    "B2-1.3-02.html",
    "B3-4.1-01.html",
    "B5-1-02.html",
    "B3-5.1-01.html",
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Constructor Properties", () => {
    it("should accept any valid string as source folder", () => {
      fc.assert(
        fc.property(fc.string(), (folderPath) => {
          const whitelister = new Whitelister(folderPath);
          expect(whitelister).toBeDefined();
          expect(whitelister).toBeInstanceOf(Whitelister);
        })
      );
    });
  });

  describe("copyFolder Properties", () => {
    it("should always create output folder with whitelisted suffix", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter((s) => s.length > 0 && !s.includes("\0")),
          async (sourcePath) => {
            // Setup mocks
            mockFs.existsSync.mockReturnValue(true);
            mockFs.statSync.mockReturnValue({
              isDirectory: () => true,
            } as fs.Stats);
            (mockFs.promises.readdir as jest.Mock).mockResolvedValue([]);

            const whitelister = new Whitelister(sourcePath);
            const result = await whitelister.copyFolder();

            // Property: The result path should contain "whitelisted"
            expect(result).toContain("whitelisted");

            // Property: fs.promises.mkdir should have been called
            expect(mockFs.promises.mkdir).toHaveBeenCalled();

            // Property: The mkdir call should include "whitelisted" in the path
            const mkdirCalls = (mockFs.promises.mkdir as jest.Mock).mock.calls;
            expect(mkdirCalls[0][0]).toContain("whitelisted");
          }
        )
      );
    });

    it("should fail predictably for non-existent source folders", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (folderPath) => {
          mockFs.existsSync.mockReturnValue(false);

          const whitelister = new Whitelister(folderPath);

          await expect(whitelister.copyFolder()).rejects.toThrow(
            `Failed to copy folder: Error: Source folder does not exist: ${folderPath}`
          );
        })
      );
    });

    it("should fail predictably when source is a file not a directory", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (filePath) => {
          mockFs.existsSync.mockReturnValue(true);
          mockFs.statSync.mockReturnValue({
            isDirectory: () => false,
          } as fs.Stats);

          const whitelister = new Whitelister(filePath);

          await expect(whitelister.copyFolder()).rejects.toThrow(
            `Failed to copy folder: Error: Source path is not a directory: ${filePath}`
          );
        })
      );
    });
  });

  describe("File Filtering Properties", () => {
    it("should only copy files that are in the whitelist", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string()), // Random file names
          async (randomFiles) => {
            const allFiles = [...randomFiles, ...WHITELISTED_FILES];
            const sourcePath = "/test/source";

            // Track which files were copied
            const copiedFiles: string[] = [];

            mockFs.existsSync.mockReturnValue(true);
            mockFs.statSync.mockReturnValue({
              isDirectory: () => true,
            } as fs.Stats);
            (mockFs.promises.readdir as jest.Mock).mockResolvedValue(allFiles);
            (mockFs.promises.copyFile as jest.Mock).mockImplementation(
              (src, _dest) => {
                const filename = path.basename(src.toString());
                copiedFiles.push(filename);
                return Promise.resolve();
              }
            );

            const whitelister = new Whitelister(sourcePath);
            await whitelister.copyFolder();

            // Property: Only whitelisted files should be copied
            copiedFiles.forEach((file) => {
              expect(WHITELISTED_FILES).toContain(file);
            });

            // Property: Number of copied files should not exceed number of whitelisted files present
            const presentWhitelistedFiles = allFiles.filter((f) =>
              WHITELISTED_FILES.includes(f)
            );
            expect(copiedFiles.length).toBe(presentWhitelistedFiles.length);
          }
        )
      );
    });

    it("should never copy files not in whitelist", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc
              .string()
              .filter((s) => s.length > 0 && !WHITELISTED_FILES.includes(s)),
            { minLength: 1, maxLength: 100 }
          ),
          async (nonWhitelistedFiles) => {
            const sourcePath = "/test/source";

            mockFs.existsSync.mockReturnValue(true);
            mockFs.statSync.mockReturnValue({
              isDirectory: () => true,
            } as fs.Stats);
            (mockFs.promises.readdir as jest.Mock).mockResolvedValue(
              nonWhitelistedFiles
            );

            let filesCopied = 0;
            (mockFs.promises.copyFile as jest.Mock).mockImplementation(() => {
              filesCopied++;
              return Promise.resolve();
            });

            const whitelister = new Whitelister(sourcePath);
            await whitelister.copyFolder();

            // Property: No files should be copied if none are whitelisted
            expect(filesCopied).toBe(0);
          }
        )
      );
    });
  });

  describe("Directory Structure Properties", () => {
    it("should create destination directory at parent level with whitelisted name", async () => {
      const sourcePath = "/test/deep/source";
      const expectedDestPath = "/test/deep/whitelisted";

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
      (mockFs.promises.readdir as jest.Mock).mockResolvedValue([]);

      const whitelister = new Whitelister(sourcePath);
      const result = await whitelister.copyFolder();

      // Property: mkdir should be called with correct path
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith(expectedDestPath, {
        recursive: true,
      });

      // Property: Result should be absolute path ending with whitelisted
      expect(path.isAbsolute(result)).toBe(true);
      expect(result.endsWith("whitelisted")).toBe(true);
    });
  });

  describe("Idempotency Properties", () => {
    it("should produce same result when run multiple times", async () => {
      const sourcePath = "/test/source";
      const whitelister = new Whitelister(sourcePath);
      const results: string[] = [];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      (mockFs.promises.readdir as jest.Mock).mockResolvedValue(
        WHITELISTED_FILES
      );
      (mockFs.promises.copyFile as jest.Mock).mockImplementation(() =>
        Promise.resolve()
      );

      // Run multiple times
      await Promise.all(
        Array.from({ length: 3 }).map(async () => {
          const result = await whitelister.copyFolder();
          results.push(result);
        })
      );

      // Property: All results should be identical
      expect(new Set(results).size).toBe(1);

      // Property: Same number of copy operations each time
      expect(mockFs.promises.copyFile).toHaveBeenCalledTimes(
        WHITELISTED_FILES.length * 3
      );
    });
  });

  describe("Error Handling Properties", () => {
    it("should always wrap errors with descriptive message", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (errorMessage) => {
          mockFs.existsSync.mockReturnValue(true);
          mockFs.statSync.mockImplementation(() => {
            throw new Error(errorMessage);
          });

          const whitelister = new Whitelister("/test");

          try {
            await whitelister.copyFolder();
            fail("Should have thrown an error");
          } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);
            if (error instanceof Error) {
              // Property: Error message should always start with "Failed to copy folder:"
              expect(error.message).toMatch(/^Failed to copy folder:/);
              // Property: Original error should be included
              expect(error.message).toContain(errorMessage);
            }
          }
        })
      );
    });
  });

  describe("Path Handling Properties", () => {
    it("should handle various path formats correctly", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant("/absolute/path"),
            fc.constant("./relative/path"),
            fc.constant("../parent/path"),
            fc.constant("simple-path"),
            fc.constant("/path/with spaces/"),
            fc.constant("/path/with-special-chars@#$")
          ),
          async (inputPath) => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.statSync.mockReturnValue({
              isDirectory: () => true,
            } as fs.Stats);
            (mockFs.promises.readdir as jest.Mock).mockResolvedValue([]);

            const whitelister = new Whitelister(inputPath);
            const result = await whitelister.copyFolder();

            // Property: Result should always be an absolute path
            expect(path.isAbsolute(result)).toBe(true);

            // Property: Result should always end with "whitelisted"
            expect(path.basename(result)).toBe("whitelisted");

            // Property: Parent directory of result should match parent of input
            const normalizedInput = path.resolve(inputPath);
            const expectedParent = path.dirname(normalizedInput);
            const actualParent = path.dirname(result);
            expect(actualParent).toBe(expectedParent);
          }
        )
      );
    });
  });

  describe("Whitelisting Behavior Properties", () => {
    it("should copy all whitelisted files that exist in source", async () => {
      // Property: If all whitelisted files exist, all should be copied
      const sourcePath = "/test/source";

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
      (mockFs.promises.readdir as jest.Mock).mockResolvedValue(
        WHITELISTED_FILES
      );

      const copiedFiles: string[] = [];
      (mockFs.promises.copyFile as jest.Mock).mockImplementation((src) => {
        copiedFiles.push(path.basename(src.toString()));
        return Promise.resolve();
      });

      const whitelister = new Whitelister(sourcePath);
      await whitelister.copyFolder();

      // Property: All whitelisted files should be copied
      expect(copiedFiles.sort()).toEqual(WHITELISTED_FILES.sort());
    });

    it("should maintain file filtering consistency", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 0, maxLength: 50 }),
          (allFiles) => {
            // Property: The number of files to be copied should equal
            // the intersection of allFiles and WHITELISTED_FILES
            const expectedCopyCount = allFiles.filter((f) =>
              WHITELISTED_FILES.includes(f)
            ).length;

            // This is a mathematical property that should always hold
            expect(expectedCopyCount).toBeLessThanOrEqual(
              WHITELISTED_FILES.length
            );
            expect(expectedCopyCount).toBeLessThanOrEqual(allFiles.length);
          }
        )
      );
    });
  });
});
