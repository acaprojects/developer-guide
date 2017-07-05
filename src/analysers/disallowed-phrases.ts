const matchWordListAnalyzer: {
    new (rule: string, phrases: Array<string | RegExp>): {};
} = require('markdown-proofing/lib/analyzers/match-word-list');

const phrases = [
    /\bAMX\b/,                  // Don't be dick and talk down competitors
    /\bCrestron\b/
];

class DisallowedPhrasesAnalyzer extends matchWordListAnalyzer {
    constructor() {
        super('disallowed-phrases', phrases);
    }
}

module.exports = DisallowedPhrasesAnalyzer;
