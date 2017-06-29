const MatchWordListAnalyzer = require('markdown-proofing/lib/analyzers/match-word-list');

const phrases = [
    /\bAMX\b/,                  // Don't be dick and talk down competitors
    /\bCrestron\b/
];

module.exports = class DisallowedPhrasesAnalyzer extends MatchWordListAnalyzer {
    constructor() {
        super('disallowed-phrases', phrases);
    }
};
