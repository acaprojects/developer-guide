import * as gulp from 'gulp';
import * as tsc from 'gulp-typescript';
import * as message from 'gulp-message';
import tslint from 'gulp-tslint';
import { exec } from 'child_process';
import { join, basename } from 'path';
import { rollup } from 'rollup';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import * as merge2 from 'merge2';
import * as R from 'ramda';

// ------
// Config

const paths = {
    src: 'src/',
    build: 'lib/',
    content: 'docs/',
    public: 'dist/'    // packaged assets ready for deploy
};

const tsConfig = (project: string, basePath = paths.src) =>
    join('./', basePath, project, 'tsconfig.json');

const tsProject = R.compose<string, string, tsc.Project>(tsc.createProject, tsConfig);

// This project is composed of a few discrete TS components due to the need to
// use different libraries / compile targets.
const app = tsProject('app');
const serviceWorkers = tsProject('service-workers');
const analysers = tsProject('analysers');

// ------
// Tools

/**
 * Create a pipe that directs a single stream to an arbitrary destination.
 *
 * :: WritableStream a, ReadableStream b => a -> b -> a
 */
const pipe = <T extends NodeJS.WritableStream, U extends NodeJS.ReadableStream>
    (dest: T) => (src: U) => src.pipe(dest);

/**
 * Merge a collection of streams into one.
 *
 * Note: intentionally just a thin wrapper around merge2 in order to provide
 * a generic type restricted to ReadWriteStreams. Without this tsc has issues
 * due to the possible IOptions type.
 *
 * :: ReadWriteStream a => [a] -> a
 */
const merge = <T extends NodeJS.ReadWriteStream>
    (streams: T[]) => merge2(streams);

/**
 * Merge and pipe a collection of streams to an arbitrary destination.
 *
 * :: ReadWriteStream a, ReadableStream b => a -> [b] -> a
 */
const pipeTo = <T extends NodeJS.ReadWriteStream, U extends NodeJS.ReadableStream>
    (dest: T) => (src: U[]) => R.compose(pipe(dest), merge)(src);

/**
 * Create a pipe that will send the incoming contents to a folder on disk.
 *
 * :: ReadableStream a, ReadWriteStream b => string -> [a] -> b
 */
const writeTo = R.compose(pipeTo, (folder: string) => gulp.dest(folder));

/**
 *  Compile a TypeScript project.
 *
 * :: Project -> ReadWriteStream
 */
const compileProject = (project: tsc.Project) => {
    const compile = pipeTo(project());
    const {js, dts} = compile([project.src()]);
    return writeTo(project.config.compilerOptions.outDir)([js, dts]);
};

/**
 * Bundle an ES6 module graph for use in browser.
 */
const bundle = (entry: string, src = paths.build, dest = paths.public) =>
    rollup({
        entry: join(src, entry),
    })
    .then(b =>
        b.write({
            dest: join(dest, basename(entry)),
            format: 'iife',

            // FIXME this is a nasty hack to get around tsc outputting
            // Object.defineProperty(exports, "__esModule", { value: true });
            intro: `if (typeof exports === 'undefined') var exports = {}`
        })
    );

// ------
// Tasks

/**
 * Lint all project Typescript source.
 */
gulp.task('lint', () =>
    (
        (...globs: string[]) =>
            gulp.src(globs)
                .pipe(tslint({
                    formatter: 'verbose'
                }))
                .pipe(tslint.report())
    )
    (
        `${paths.src}**/*.ts`,
        __filename
    )
);

/**
 * Run the proofing tools over doc contents.
 */
gulp.task('proof', cb =>
    (
        (...globs: string[]) =>
            exec(`node node_modules/markdown-proofing/cli.js ${globs.join(' ')} --color`,
                (err, stdout) => {
                    message.info(stdout);
                    cb(err);
                }
            )
    )
    (
        `${paths.content}**/*.md`,
        '*.md'
    )
);

/**
 * Nuke old build assets.
 */
gulp.task('clean', () =>
    (
        (...globs: string[]) => del(globs)
    )
    (
        paths.public,
        paths.build
    )
);

/**
 * Build the service workers
 */
gulp.task('compile:sw', () => compileProject(serviceWorkers));

/**
 * Build the main front-end.
 */
gulp.task('compile:app', () => compileProject(app));

/**
 * Build the content proofing tools.
 */
gulp.task('compile:tools', () => compileProject(analysers));

/**
 * Collect the static assets for the public site.
 */
gulp.task('package:static', () =>
    (
        (...globs: string[]) => {
            const site = gulp.src(globs);
            return writeTo(paths.public)([site]);
        }
    )
    (
        `${paths.src}app/*.html`,
        `${paths.src}app/*.ico`,
        `${paths.src}app/coverpage*`,
        `${paths.content}**/*.*`
    )
);

/**
 * Prep the service workers for use in-browser.
 */
gulp.task('package:sw', () => bundle('service-workers/doc-cache.js'));

/**
 * Rollup the app front-end.
 */
gulp.task('package:app', () => bundle('app/docsify-conf.js'));

/**
 * Perform a complete project build.
 */
gulp.task('build', () =>
    (
        (...tasks: Array<string | string[]>) => runSequence(...tasks)
    )
    (
        ['lint', 'clean'],
        'compile:tools',
        'proof',
        ['compile:app', 'compile:sw'],
        ['package:static', 'package:sw', 'package:app'],
    )
);

gulp.task('default', () =>
    (
        (...tasks: Array<string | string[]>) => runSequence(...tasks)
    )
    (
        'build'
    )
);
