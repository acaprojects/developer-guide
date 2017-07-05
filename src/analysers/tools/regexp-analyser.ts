import * as R from 'ramda';
import { Analyser, AnalyserResult, AnalyserMessage } from './analyser-lib';
import { execAll, locate } from './regexp-util';

/**
 * Tuple representation a parser definition as RegExp to search for along with
 * and info message string to be shown when matched.
 */
export type ParserDef = [RegExp, string];

/**
 * Tuple used to represent an Analyser rule. Composed of a rule name with a
 * collection of parser definitions that will cause the a message to be emitted
 * for the rule.
 */
export type RegExpAnalyserRule = [string, ParserDef[]];

/**
 * Function which when passed a body of text will create a set of
 * AnalyserMessages for violations against Analyser rules.
 */
type Parser = (content: string) => AnalyserMessage[];

/**
 * Pre-parser for creating AnlyzerMessages. Provides partial application of
 * arguments and insertion of context into info message.
 */
const message = (type: string, text: string) =>
    (occurance: RegExpExecArray) => {
        const [line, column] = locate(occurance);
        const info = `"${occurance[0]}" ${text}`;
        return new AnalyserMessage(type, info, line, column);
    };

/**
 * Build an parser which once provided with the rule name, a regexp and info
 * message will parse content to list of AnalyserMessages containing any
 * violations found.
 */
const createParser = (rule: string, re: RegExp, info: string) =>
    (content: string) =>
    R.map(message(rule, info), execAll(re, content));

/**
 * Map a rule definition to a list of Parsers.
 */
const createParsers = (r: RegExpAnalyserRule) =>
    R.map(p => createParser(r[0], p[0], p[1]), r[1]);

/**
 * Base class for creating analysers which parse a body of text for matches
 * against a RegExp and emits rule violations for each match.
 */
export abstract class RegExpAnalyser implements Analyser {
    public constructor(public readonly rules: RegExpAnalyserRule[]) {
    }

    public analyze(content: string) {
        const parsers = R.chain(createParsers, this.rules);

        const result = new AnalyserResult();
        result.messages = R.chain(f => f(content), parsers);

        return result;
    }
}
