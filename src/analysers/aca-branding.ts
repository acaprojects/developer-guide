import * as R from 'ramda';
import { AnalyserResult } from './tools/analyser-lib';
import { analyser } from './tools/regex-analyser';

/**
 * Text analyser for ensure ACA product names use the correct syntax.
 */
class ACABrandingAnalyzer {
    public constructer() {
        // Nothing to do here, specified so tsc exposes this correctly.
    }

    public analyze(content: string) {
        const errorIf = analyser('aca-branding-error');
        const warnIf = analyser('aca-branding-warning');

        const rules  = [
            // Ensure 'ACAEngine' is always referred to with correct capitalisation.
            errorIf(
                /\b(?!ACAEngine)[Aa][Cc][Aa][Ee]ngine\b/g,
                'is incorrect capitalisation - use "ACAEngine"'
            ),

            // Allow the concatenated version (as per the trademark) only in the
            // original markdown. The renderer will insert a hairline space
            // (&#8202;) before display so we can keep nice typography.
            errorIf(
                /\bACA\s+Engine\b/gi,
                'contains incorrect spacing - use "ACAEngine"'
            ),

            // Text may refer to 'engine' under another context, but chances are
            // the intended context is ACAEngine.
            warnIf(
                /\bEngine\b/gi,
                'may be missing a prefix - use "ACAEngine" if referring to the product'
            )
        ];

        const result = new AnalyserResult();

        result.messages = R.chain(f => f(content), rules);

        return result;
    }
}

module.exports = ACABrandingAnalyzer;
