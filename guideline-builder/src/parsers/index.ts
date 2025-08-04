import { TypedArray } from "type-fest";

export { FNMAGuidelineParser } from "./fnma-parser";

/**
 * `HTMLGuidelineParser` represents an object that parses guidelines from a
 * HTML page
 */
export interface HTMLGuidelineParser {
  parseURL(url: URL): Promise<ParsedGuideline[]>;
}

/**
 * `PDFGuidelineParser` represents an object the parses guidelines from a
 * PDF
 */
export interface PDFGuidelineParser {
  parsePDF(
    str: string | URL | TypedArray | ArrayBuffer
  ): Promise<ParsedGuideline[]>;
}

export type ParsedGuideline = {
  title: string;
  body: string;
};

// From pdf.js, and typed so that it can be re-used
export type PDFOutlineItem = {
  title: string;
  bold: boolean;
  italic: boolean;
  /**
   * - The color in RGB format to use for
   * display purposes.
   */
  color: Uint8ClampedArray;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dest: string | Array<any> | null;
  url: string | null;
  unsafeUrl: string | undefined;
  newWindow: boolean | undefined;
  count: number | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Array</*elided*/ any>;
};

export function isPDFOutlineItem(item: unknown): item is PDFOutlineItem {
  return (
    item !== null &&
    typeof item === "object" &&
    "title" in item &&
    "dest" in item &&
    "items" in item
  );
}
