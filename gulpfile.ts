import * as gulp from 'gulp';
import * as tsc from 'gulp-typescript';
import * as message from 'gulp-message';
import tslint from 'gulp-tslint';
import { exec } from 'child_process';
import * as runSequence from 'run-sequence';
import * as del from 'del';
import * as merge from 'merge2';

const tsProject = tsc.createProject('./tsconfig.json');

const npmconfig = require('./package.json');
const tscConfig = require('./tsconfig.json');

const paths = {
    src: tscConfig.compilerOptions.baseUrl,
    build: tscConfig.compilerOptions.outDir,
    content: 'docs/',
    public: 'dist/'    // packaged assets ready for deploy
};

/**
 * Pipe a collection of streams to and arbitrart destination and merge the
 * results.
 */
const pipeTo = (dest: NodeJS.ReadWriteStream) =>
    (...src: NodeJS.ReadableStream[]) =>
    merge(src.map(s => s.pipe(dest)));

/**
 * Lint all project Typescript source.
 */
gulp.task('lint', () =>
    (
        (...src: NodeJS.ReadWriteStream[]) =>
            merge(src)
                .pipe(tslint({
                    formatter: 'verbose'
                }))
                .pipe(tslint.report())
    )
    (
        tsProject.src(),
        gulp.src(__filename)
    )
);

/**
 * Run the proofing tools over doc contents.
 */
gulp.task('proof', cb =>
    (
        (...globs: string[]) =>
            exec(`node node_modules/markdown-proofing/cli.js ${globs.join(' ')} --color`,
                (err, stdout, stderr) => {
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
 * Nuke old build assetts.
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
 * Transpile the Typescript project components.
 */
gulp.task('build', () =>
    (
        (...src: NodeJS.ReadWriteStream[]) => {
            const tscOutput = merge(src).pipe(tsProject());
            const pipeToBuild = pipeTo(paths.build);
            return pipeToBuild(
                tscOutput.js,
                tscOutput.dts
            );
        }
    )
    (
        tsProject.src()
    )
);

// TODO package / deploy

gulp.task('default', () =>
    runSequence(
        ['proof', 'clean'],
        'build'
    )
);
