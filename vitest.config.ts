import { defineConfig } from "vitest/config";
import { BaseSequencer, WorkspaceSpec } from "vitest/node";
import * as path from "path";
import { b } from "vitest/dist/chunks/suite.CcK46U-P.js";

const extractLeadingInt = (str: string) => str.match(/^\d+/)?.[0] || undefined;

class Sequencer extends BaseSequencer {
  /**
   * Run tests in order first by the leading integer in the basename, then by the basename.
   */
  async sort(files: WorkspaceSpec[]) {
    files.sort(([a1, amod, a3], [b1, bmod, b3]) => {
      const abase = path.basename(amod);
      const bbase = path.basename(bmod);
      const abaseIntStr = extractLeadingInt(abase);
      const bbaseIntStr = extractLeadingInt(bbase);
      if (abaseIntStr) {
        if (bbaseIntStr) {
          return parseInt(abaseIntStr) - parseInt(bbaseIntStr);
        }
        return -1;
      }
      return path.basename(abase).localeCompare(bbase);
    });
    // files.forEach(([path, mod, content]) => {
    //   console.log(mod);
    // });
    return files;
  }
}

export default defineConfig({
  test: {
    fileParallelism: false,
    maxConcurrency: 1,
    bail: 1,
    sequence: {
      sequencer: Sequencer,
      concurrent: false,
    },
  },
});
