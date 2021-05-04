/**
 * String utilities for common advanced string operations, which are needed across multiple
 * locations.
 */
export class StringUtils {

  /**
   * Transform a model name, as received from the ContentDelivery API to a safe model name that
   * can be loaded through the ES module loaders.
   *
   * @param {string} modelName  The original model name
   * @returns {string}
   */
  static SafeModelName: (modelName: string) => string = modelName => {
    let processedName = modelName;
    processedName = processedName.replace('(', '_').replace(')', '_');
    processedName = StringUtils.TrimRight('_', processedName);
    return processedName;
  }

  /**
   * Trim all occurences of a string of the end of another string
   *
   * @param {string} char     The string to search
   * @param {string} subject  The string to manipulate
   * @returns {string}        The manipulated string
   */
  static TrimRight: (char: string, subject?: string) => string = (char, subject) => {
    if (typeof char !== 'string' || char.length < 1) {
      throw new Error('Char must be a string of minimal one char');
    }
    if (typeof subject === 'undefined' || subject === null) {
      return '';
    }
    if (typeof subject !== 'string') {
      throw new Error('Subject must be a string, received: ' + typeof subject);
    }

    if (char.length > subject.length) {
      return subject;
    }

    const length = -1 * char.length;
    let out = subject;
    while (out.slice(length) === char) {
      out = out.substr(0, out.length + length);
    }
    return out;
  }

  /**
   * Trim all occurences of a string of the start of another string
   *
   * @param {string} char     The string to search
   * @param {string} subject  The string to manipulate
   * @returns {string}        The manipulated string
   */
  static TrimLeft: (char: string, subject: string) => string = (char, subject) => {
    if (typeof char !== 'string' || char.length < 1) {
      throw new Error('Char must be a string of minimal one char');
    }
    if (typeof subject === 'undefined' || subject === null) {
      return '';
    }
    if (typeof subject !== 'string') {
      throw new Error('Subject must be a string, received: ' + typeof subject);
    }

    if (char.length > subject.length) {
      return subject;
    }

    let out = subject;
    while (out.slice(0, char.length) === char) {
      out = out.substr(char.length);
    }
    return out;
  }
}

// Create exported functions
export const SafeModelName = StringUtils.SafeModelName;
export const TrimRight = StringUtils.TrimRight;
export const TrimLeft = StringUtils.TrimLeft;
export default StringUtils;

