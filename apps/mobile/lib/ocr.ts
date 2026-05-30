// ML Kit hands back a blocks → lines → elements tree. The `select` step lets
// the user tap individual lines, then we stitch the chosen lines back into
// readable prose here:
//   • consecutive lines from the same block are one flow → join with spaces;
//   • a line ending in a hyphen is a word split across the break → de-hyphenate;
//   • a block boundary is a paragraph break → join with a blank line.
// Lines arrive in reading order (top-to-bottom), which is correct for the
// single-column book pages this flow targets.

/** A recognized line tagged with the block it came from (its paragraph). */
export interface OcrLine {
  text: string;
  /** Index of the parent block — used to detect paragraph boundaries. */
  blockIndex: number;
}

/**
 * Stitch an ordered set of lines into readable prose. Lines may be a subset
 * (e.g. the ones the user tapped) — they're joined in the order given, with
 * paragraph breaks inserted wherever the block index changes.
 */
export function reflowLines(lines: OcrLine[]): string {
  let out = '';
  let prevBlock = -1;

  for (const { text, blockIndex } of lines) {
    const line = text.trim();
    if (!line) continue;

    if (!out) {
      out = line;
    } else if (blockIndex !== prevBlock) {
      out += `\n\n${line}`;
    } else if (/\p{L}-$/u.test(out)) {
      // Drop a trailing hyphen that follows a letter — almost always a word
      // broken across the line break (e.g. "recog-" + "nition").
      out = out.slice(0, -1) + line;
    } else {
      out += ` ${line}`;
    }

    prevBlock = blockIndex;
  }

  return out;
}
