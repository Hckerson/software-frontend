import { HOME_PATH } from "@/lib/constants";

export const internalPath = (candidate: string | null | undefined): string =>
    candidate?.startsWith("/") && !candidate.startsWith("//")
        ? candidate
        : HOME_PATH;
