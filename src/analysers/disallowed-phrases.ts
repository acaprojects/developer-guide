import { RegExpAnalyserRule, RegExpAnalyser } from './tools/regexp-analyser';

const rules: RegExpAnalyserRule[] = [
    ['disallowed-phrases', [
        [
            // Check for mentions of competitors.
            /\b(AMX)|(Crestron)\b/gi,
            `don't be a dick and talk down competitors - they build nice things too`
        ]
    ]],
];

/**
 * Text analyser for scanning for any disallowed phrases.
 */
class DisallowedPhrasesAnalyzer extends RegExpAnalyser {
    constructor() {
        super(rules);
    }
}

module.exports = DisallowedPhrasesAnalyzer;
