import * as gulp from 'gulp';
import * as tsc from 'gulp-typescript';
import tslint from 'gulp-tslint';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import * as merge from 'merge2';

const tsProject = tsc.createProject('./tsconfig.json');

const npmconfig = require('./package.json');

const paths = {
    src: 'src/',
    docs: 'docs/',
    lib: 'lib/',                    // compiled source
    dist: 'dist/',                  // packaged assets ready for deploy
};

/**
 * Pipe a collection of streams to and arbitrart destination and merge the
 * results.
 */
const pipeTo = (dest: NodeJS.ReadWriteStream) =>
    (...src: NodeJS.ReadableStream[]) => merge(src.map((s) => s.pipe(dest)));

/**
 * Pipe a collection of streams out to our dist directory.
 */
const pipeToDist = pipeTo(gulp.dest(paths.dist));

/**
 * Wrap a shell command as an async child process.
 */
const shellProcess = (command: string) =>
    (args: string[] = []) => promisify(exec)(`${command} ${args.join(' ')}`);

/**
 * Run a set of markdown files through proofing tools for readability, spelling
 * and language analytics.
 */
const proof = shellProcess('markdown-proofing');

/**
 * Lint all project Typescript source.
 */
gulp.task('lint', () =>
    tsProject.src()
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
);

/**
 * Run the proofing tools over doc contents.
 */
gulp.task('proof', (done) =>
    proof([
        `${paths.docs}**/*.md`
    ])
);

/**
 * Nuke any output from anything constructer by build / doc scripts below.
 */
gulp.task('clean', () =>
    del([
        paths.dist,
        paths.lib
    ])
);

/**
 * Transpile the Typescript project components.
 */
gulp.task('build', () => {
    const tscOutput = tsProject.src().pipe(tsProject());

    return pipeToDist(
        tscOutput.js,
        tscOutput.dts
    );
});

// TODO package / deploy

gulp.task('default', () =>
    runSequence([
        'proof',
        'build'
    ])
);
