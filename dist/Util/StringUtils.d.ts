/**
 * String utilities for common advanced string operations, which are needed across multiple
 * locations.
 */
export declare class StringUtils {
    /**
     * Transform a model name, as received from the ContentDelivery API to a safe model name that
     * can be loaded through the ES module loaders.
     *
     * @param {string} modelName  The original model name
     * @returns {string}
     */
    static SafeModelName: (modelName: string) => string;
    /**
     * Trim all occurences of a string of the end of another string
     *
     * @param {string} char     The string to search
     * @param {string} subject  The string to manipulate
     * @returns {string}        The manipulated string
     */
    static TrimRight: (char: string, subject?: string) => string;
    /**
     * Trim all occurences of a string of the start of another string
     *
     * @param {string} char     The string to search
     * @param {string} subject  The string to manipulate
     * @returns {string}        The manipulated string
     */
    static TrimLeft: (char: string, subject: string) => string;
}
export declare const SafeModelName: (modelName: string) => string;
export declare const TrimRight: (char: string, subject?: string) => string;
export declare const TrimLeft: (char: string, subject: string) => string;
export default StringUtils;
