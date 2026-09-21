import { claimedCount } from "./docs";
import type { Finding } from "./types";

export const missing = (from: string[], within: string[]): string[] =>
    from.filter((item) => !within.includes(item));

export const countCheck = (
    check: string,
    readme: string,
    unit: string,
    actual: number,
): Finding[] => {
    const claimed = claimedCount(readme, unit);

    return claimed === null || claimed === actual
        ? []
        : [
              {
                  check,
                  message: `README claims ${claimed} ${unit}; ${actual} exist`,
              },
          ];
};
