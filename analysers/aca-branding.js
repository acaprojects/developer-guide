const AnalyzerResult = require('markdown-proofing/lib/analyzer-result');
const Location = require('markdown-proofing/lib/location');
const R = require('ramda');

/**
 * Generator for every occurance of a regex within a string.
 */
function* execAll(re, str) {
    const match = re.exec(str);
    if (match != null) {
        yield match;
        yield* execAll(re, str);
    }
}

/**
 * Create a list of regex match objects found within a string.
 */
const occurances = R.pipe(execAll, Array.from);

/**
 * Map a (str, index) to a [line, column] tuple.
 */
const lineCol = R.juxt([Location.getLine, Location.getLineColumn]);

/**
 * Map a regex match object to a [line, column] tuple of the match location.
 */
const locate = match => lineCol(match.input, match.index);

/**
 * Text analyser for ensure ACA product names use the correct syntax.
 */
module.exports = class ACABrandingAnalyzer {
    constructor() {}

    analyze(str) {
        const result = new AnalyzerResult();

        const alert = (rule, info) => match => result.addMessage(rule, info, ...locate(match));

        const findAll = re => occurances(re, str);

        const alerter = rule => (re, info) => R.map(alert(rule, info), findAll(re));

        const errorIf = alerter('aca-branding-error');
        const warnIf = alerter('aca-branding-warning');

        // Ensure 'ACAEngine' is always referred to with correct capitalisation.
        errorIf(/\b(?!ACAEngine)[Aa][Cc][Aa][Ee]ngine\b/g, 'ACAEngine capitalised incorrectly');

        // Allow the concatenated version (as per the trademark) only in the
        // original markdown. The renderer will insert a hairline space
        // (&#8202;) before display so we can keep nice typography.
        errorIf(/\bACA\s+Engine/gi, 'ACAEngine should be written as a single, concatenated word');

        // Text may refer to 'a engine' under another context, but changces are
        // the intended context is ACAEngine.
        warnIf(/\b(?!ACA)\w+\s+Engine\b/gi, 'Engine should be prefixed as ACAEngine');

        return result;
    }
};
