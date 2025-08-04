import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import { TypedArray } from "type-fest";
import { HTMLGuidelineParser, isPDFOutlineItem, ParsedGuideline } from ".";
import {
  TextItem,
  TextContent,
  TextMarkedContent,
  RefProxy,
} from "pdfjs-dist/types/src/display/api";
import { JSDOM } from "jsdom";
import path from "path";

export const rawOutputDir = "guidelines/fnma/raw";
const parsedOutputDir = "guidelines/fnma/parsed/";

const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem => {
  return !("type" in item);
};

function toMarkdown(content: TextContent): string {
  let str = "";

  // Skip highlights
  const items = content.items.filter(isTextItem);

  for (const item of items) {
    str += item.str;

    if (item.hasEOL) {
      str += "\n";
    }
  }

  return str;
}

const tableOfContentsId = "structured-content-toc";
const guidelineContentId = "topic_content";

export class FNMAGuidelineParser implements HTMLGuidelineParser {
  async parseURL(url: URL): Promise<ParsedGuideline[]> {
    const topicElements = await this.getGuidelineURLs(url);
    const guidelines: ParsedGuideline[] = [];

    for (const topicLink of topicElements) {
      const topicHeader = topicLink.topicHeader;
      const [topicSection] = topicHeader.split(",");

      const topicPageRelativeAddr = topicLink.topicRelativeLink;
      if (topicPageRelativeAddr === null)
        throw new Error("Topic does not have a relevant URL");
      const topicPageURL = new URL(
        topicPageRelativeAddr,
        "https://selling-guide.fanniemae.com"
      );

      const guidelineText = await this.getGuidelineText(topicPageURL.href);

      if (guidelineText === null)
        throw new Error("Guideline text was not found for element");

      guidelines.push({
        title: topicSection,
        body: guidelineText.outerHTML,
      });
    }

    console.info("Done!");
    return guidelines;
  }

  getGuidelineTextFromDOM(domContent: string): HTMLElement | null {
    const soup = new JSDOM(domContent).window.document;

    // Get only the guideline content from the page
    const content = soup.getElementById(guidelineContentId);

    return content;
  }

  async getGuidelineText(guidelineURL: string) {
    const resp = await fetch(guidelineURL);
    const html = await resp.text();

    return this.getGuidelineTextFromDOM(html);
  }

  async getGuidelineURLs(
    url: URL
  ): Promise<{ topicHeader: string; topicRelativeLink: string }[]> {
    console.info("Fetching FNMA guidelines");

    const resp = await fetch(url);
    const html = await resp.text();

    console.info("Parsing table of contents");

    const soup = new JSDOM(html).window.document;

    // Find the table of contents

    const toc = soup.getElementById(tableOfContentsId);

    if (toc === null)
      throw new Error("Table of Contents not found while parsing guidelines");

    console.info("Finding guidelines");

    const topicAnchorElements: HTMLAnchorElement[] = [];

    toc.querySelectorAll(".subpart").forEach((subpart) =>
      subpart.querySelectorAll(".chapter").forEach((chapter) =>
        chapter.querySelectorAll(".topic").forEach((topic) => {
          const topicLink = topic.getElementsByTagName("a")[0];

          topicAnchorElements.push(topicLink);
        })
      )
    );

    return topicAnchorElements.map((elem) => ({
      topicHeader: elem.text.split(",")[0],
      topicRelativeLink: elem.getAttribute("href") ?? "",
    }));
  }

  async parsePDF(
    src: string | URL | TypedArray | ArrayBuffer
  ): Promise<ParsedGuideline[]> {
    const loadingTask = pdfjsLib.getDocument(src);
    const pdf = await loadingTask.promise;

    console.log(`PDF loaded with ${pdf.numPages} pages.`);

    const outline = await pdf.getOutline();

    const selectedPart = outline.find(
      (outlinePart) =>
        outlinePart.title === "Part B, Origination Through Closing"
    );

    if (selectedPart === undefined) {
      throw new Error(
        "Section for guidelines not found in FNMA selling guide!"
      );
    }

    const guidelines: ParsedGuideline[] = [];

    // Parse via the table of contents in the PDF (the outline)
    for (const subpart of selectedPart.items.filter(isPDFOutlineItem)) {
      for (const chapter of subpart.items.filter(isPDFOutlineItem)) {
        for (const section of chapter.items.filter(isPDFOutlineItem)) {
          for (const guideline of section.items.filter(isPDFOutlineItem)) {
            if (guideline.dest === null || typeof guideline.dest === "string") {
              throw new Error("Reference for guideline was null or a string");
            }

            // Zero-indexed page number that the guideline points to
            const pageIndex = await pdf.getPageIndex(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
              guideline.dest[0] as RefProxy
            );

            const page = await pdf.getPage(pageIndex + 1);
            const pageText = await page.getTextContent();

            guidelines.push({
              title: guideline.title,
              body: toMarkdown(pageText),
            });
          }
        }
      }
    }

    return guidelines;
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
const main = async () => {
  if (process.argv.length !== 3) {
    throw new Error(
      `Expected 3 arguments for the root directory. Got ${process.argv.length}`
    );
  }

  const rootDir = process.argv[2];

  const parser = new FNMAGuidelineParser();

  fs.readdirSync(path.join(rootDir, rawOutputDir)).forEach((file) => {
    console.info(`Parsing file '${file}'`);
    const inputData = fs.readFileSync(
      path.join(rootDir, rawOutputDir, file),
      "utf8"
    );

    const parsedFile = parser.getGuidelineTextFromDOM(inputData);

    if (parsedFile === null)
      throw new Error("Could not find guideline text while parsing file");

    const outputFile = path.join(rootDir, parsedOutputDir, file);
    fs.mkdirSync(path.join(rootDir, parsedOutputDir), { recursive: true });
    fs.writeFileSync(outputFile, parsedFile.outerHTML);
  });
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
