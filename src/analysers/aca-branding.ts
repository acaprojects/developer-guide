import * as R from 'ramda';

const analyzerResult: {
    new (): {
        addMessage(type: string, text: string, line: number, column: number): void;
    }
} = require('markdown-proofing/lib/analyzer-result');

const location: {
    getLine(source: string, index: number): number;
    getLineColumn(source: string, index: number): number;
} = require('markdown-proofing/lib/location');

/**
 * Generator for every occurrence of a regex within a string.
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
const occurances: (re: RegExp, srt: string) => RegExpExecArray[]
    = R.pipe(execAll, Array.from);

/**
 * Map a regex match object to a [line, column] tuple of the match location.
 */
const locate = (match: RegExpExecArray) =>
    R.map(
        f => f(match.input, match.index),
        [location.getLine, location.getLineColumn]
    ) as [number, number];

/**
 * Text analyser for ensure ACA product names use the correct syntax.
 */
class ACABrandingAnalyzer {
    public constructer() {
        // Nothing to do here, specified so tsc exposes this correctly.
    }

    public analyze(content: string) {
        const result = new analyzerResult();

        const alert = (rule: string, info: string) =>
            (match: RegExpExecArray) => {
                const [line, column] = locate(match);
                const message = `"${match[0]}" ${info}`;
                result.addMessage(rule, message, line, column);
            };

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

module.exports = ACABrandingAnalyzer;
