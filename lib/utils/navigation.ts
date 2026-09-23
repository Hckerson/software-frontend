const matches = (pathname: string, href: string): boolean =>
    pathname === href || pathname.startsWith(`${href}/`);

export const activeHref = (
    pathname: string,
    hrefs: string[],
): string | undefined =>
    hrefs
        .filter((href) => matches(pathname, href))
        .sort((a, b) => b.length - a.length)[0];
