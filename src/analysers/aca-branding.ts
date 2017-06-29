import * as AnalyzerResult from 'markdown-proofing/lib/analyzer-result';
import { getLine, getLineColumn } from 'markdown-proofing/lib/location';
import * as R from 'ramda';

/**
 * Generator for every occurance of a regex within a string.
 */
function* execAll(re: RegExp, str: string) {
    const match = re.exec(str);
    if (match != null) {
        yield match;
        execAll(re, str);
    }
}

/**
 * Create a list of regex match objects found within a string.
 */
const occurances = R.pipe(execAll, Array.from);

/**
 * Map a (str, index) to a [line, column] tuple.
 */
const lineCol = R.juxt([getLine, getLineColumn]);

/**
 * Map a regex match object to a [line, column] tuple of the match location.
 */
const locate = (match: RegExpExecArray) => lineCol(match.input, match.index);

/**
 * Text analyser for ensure ACA product names use the correct syntax.
 */
export default class ACABrandingAnalyzer {
    public static analyze(content: string) {
        const result = new AnalyzerResult();

        const alert = (rule: string, info: string) =>
            (match: RegExpExecArray) =>
            result.addMessage(rule, info, ...locate(match));

        const findAll = (re: RegExp) => occurances(re, content);

        const alerter = (rule: string) =>
            (re: RegExp, info: string) =>
            R.map(alert(rule, info), findAll(re));

        const errorIf = alerter('aca-branding-error');
        const warnIf = alerter('aca-branding-warning');

        // Ensure 'ACAEngine' is always referred to with correct capitalisation.
        errorIf(
            /\b(?!ACAEngine)[Aa][Cc][Aa][Ee]ngine\b/g,
            'ACAEngine capitalised incorrectly'
        );

        // Allow the concatenated version (as per the trademark) only in the
        // original markdown. The renderer will insert a hairline space
        // (&#8202;) before display so we can keep nice typography.
        errorIf(
            /\bACA\s+Engine\b/gi,
            'ACAEngine should be written as a single, concatenated word'
        );

        // Text may refer to 'engine' under another context, but chances are
        // the intended context is ACAEngine.
        warnIf(
            /\bEngine\b/gi,
            'Engine should be prefixed as ACAEngine'
        );

        return result;
    }
}
