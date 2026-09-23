export interface Finding {
    check: string;
    message: string;
}

export interface Documents {
    readme: string;
    architecture: string;
    sections: string;
    components: string;
}

export interface Inventory {
    routes: string[];
    fallbacks: Record<string, boolean>;
    sectionFiles: Record<string, string[]>;
    componentFiles: Record<string, string[]>;
    queryReaders: string[];
    errorRenderers: string[];
}
