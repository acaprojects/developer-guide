import { RegExpAnalyserRule, RegExpAnalyser } from './tools/regexp-analyser';

const rules: RegExpAnalyserRule[] = [
    ['aca-branding-error', [
        [
            // Ensure 'ACAEngine' is always referred to with correct
            // scapitalisation.
            /\b(?!ACAEngine)[Aa][Cc][Aa][Ee]ngine\b/g,
            'is incorrect capitalisation - use "ACAEngine"'
        ],
        [
            // Allow the concatenated version (as per the trademark) only in
            // the original markdown. The renderer will insert a hairline space
            // (&#8202;) before display so we can keep nice typography.
            /\bACA\s+Engine\b/gi,
            'contains incorrect spacing - use "ACAEngine"',
        ]
    ]],

    ['aca-branding-warning', [
        [
            // Text may refer to 'engine' under another context, but chances
            // are the intended context is ACAEngine.
            /\bEngine\b/gi,
            'may be missing a prefix - use "ACAEngine" if referring to the product'
        ],
    ]]
];

/**
 * Text analyser for ensure ACA product names use the correct syntax.
 */
class ACABrandingAnalyser extends RegExpAnalyser {
    constructor() {
        super(rules);
    }
}

module.exports = ACABrandingAnalyser;
