const URL_REGEX = /([a-z]{1,2}tps?):\/\/((?:(?!(?:\/|#|\?|&)).)+)(?:(\/(?:(?:(?:(?!(?:#|\?|&)).)+\/))?))?(?:((?:(?!(?:\.|$|\?|#)).)+))?(?:(\.(?:(?!(?:\?|$|#)).)+))?(?:(\?(?:(?!(?:$|#)).)+))?(?:(#.+))?/;

/**
 * Extract the path portion of a full url
 * Note: We are using a regex instead of the URL class to support compatibility
 * with the react-native environment without introducing a polyfill.
 * 
 * @param requestUrl 
 */
export function extractUrlPath(requestUrl: string): string | undefined {
    const result = requestUrl.match(URL_REGEX);

    let path: string | undefined;
    if (result?.length) {
        result.shift();
        result.shift();
        result.shift();
        path = result.join("");
    }

    return path;

}
