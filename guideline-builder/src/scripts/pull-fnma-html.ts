import fs from "fs";
import { FNMAGuidelineParser, rawOutputDir } from "../parsers/fnma-parser";
import path from "path";

const main = async () => {
  if (process.argv.length !== 3) {
    throw new Error(
      `Expected 3 arguments for the root directory. Got ${process.argv.length}`
    );
  }

  const rootDir = process.argv[2];

  const url = new URL(
    "https://selling-guide.fanniemae.com/sel/b/origination-through-closing"
  );

  const parser = new FNMAGuidelineParser();
  const guidelineURLs = await parser.getGuidelineURLs(url);

  for (const [index, guidelineURL] of guidelineURLs.entries()) {
    const topicPageURL = new URL(
      guidelineURL.topicRelativeLink,
      "https://selling-guide.fanniemae.com"
    );

    console.info(
      `(${index}/${guidelineURLs.length}) Fetching HTML for ${topicPageURL}`
    );

    const resp = await fetch(topicPageURL);
    const text = await resp.text();

    fs.mkdirSync(path.join(rootDir, rawOutputDir), { recursive: true });
    fs.writeFileSync(
      path.join(
        rootDir,
        rawOutputDir,
        guidelineURL.topicHeader.trim() + ".html"
      ),
      text
    );
  }
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
