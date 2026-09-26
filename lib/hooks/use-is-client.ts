import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const onClient = () => true;

const onServer = () => false;

export const useIsClient = (): boolean =>
    useSyncExternalStore(subscribe, onClient, onServer);
