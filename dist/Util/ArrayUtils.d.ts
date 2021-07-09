/**
 * The value is considered to be an array when either Array.isArray exists
 * and says it's an array or the value is an object where the constructor
 * is the constructor of Array.
 *
 * When an itemGuard is provided, this will also check if all values pass
 * the itemGuard.
 *
 * @param toTest The value to be checked
 * @param itemGuard The check to see if all items match this criteria
 * @returns True if all checks are postive (i.e. it's an array, with all items matching); False otherwise
 */
export declare const isArray: <T = unknown>(toTest: unknown, itemGuard?: (toTest: unknown) => toTest is T) => toTest is T[];
