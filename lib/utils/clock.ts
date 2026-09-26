const MS_PER_SECOND = 1000;

export const nowMs = (): number => Date.now();

export const nowSeconds = (): number => Math.floor(nowMs() / MS_PER_SECOND);

export const hasElapsed = (epochSeconds: number): boolean =>
    epochSeconds * MS_PER_SECOND < nowMs();
