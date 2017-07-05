import * as R from 'ramda';
import { AnalyserMessage, Location } from './analyser-lib';

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
 * Create a list of all regex match objects found within a string.
 */
const occurances: (re: RegExp, srt: string) => RegExpExecArray[]
    = R.pipe(execAll, Array.from);

/**
 * Map a regex match object to a [line, column] tuple of the match location.
 */
const locate = (match: RegExpExecArray) =>
    R.map(
        f => f(match.input, match.index),
        [Location.getLine, Location.getLineColumn]
    ) as [number, number];

/**
 * Pre-parser for creating AnlyzerMessages. Provides partial application of
 * arguments inserting of context into info message.
 */
const message = (type: string, text: string) =>
    (occurance: RegExpExecArray) => {
        const [line, column] = locate(occurance);
        const info = `"${occurance[0]}" ${text}`;
        return new AnalyserMessage(type, info, line, column);
    };

/**
 * Build an analyser which once provided with the rule name, a regex and info
 * message will parse content to list of AnalyserMessages containing any
 * violations found.
 */
export const analyser = (rule: string) =>
    (re: RegExp, info: string) =>
    (content: string) =>
        R.map(message(rule, info), occurances(re, content));
