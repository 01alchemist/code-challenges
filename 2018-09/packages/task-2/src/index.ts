/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal } from '~common/utils';
import * as fs from 'fs';
import * as minimist from 'minimist';
const run = require('./app').default;
const APP_NAME = 'b-tree';
const options = minimist(process.argv.slice(2));

/**
 *  Catch --help argument
 */
if (options.help) {
    printHelp();
    process.exit(0);
}

/**
 *  Handle no input exception
 */
if (!options.input) {
    Terminal.error(`No input!`);
    printHelp();
    process.exit(1);
}

const inputData = fs.readFileSync(options.input, 'utf-8');

/**
 * Execute application with input data
 */
run(inputData, options.print ? options.print === 'true' : undefined);

/**
 * Print help
 */
function printHelp() {
    Terminal.info(`Usage: ${APP_NAME} --input=path/to/file.txt`);
}

if (process.env.NODE_ENV === 'development') {
    if (module['hot']) {
        module['hot'].accept('./app', function() {
            const App = require('./app').default;
            App();
            Terminal.info('App hot reloaded');
        });
    }
}

process.exit(0);
