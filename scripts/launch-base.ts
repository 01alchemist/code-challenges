// tslint:disable
/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal, Color } from '../common/utils';
import * as path from 'path';
import * as minimist from 'minimist';
import * as child_process from 'child_process';
import * as fs from 'fs';

const { spawn } = child_process;

interface Instance extends child_process.ChildProcess {
    name: string;
}

const baseDir = process.cwd();
let envPath = `${baseDir}/env/${process.env.USER}.env`;
if (!fs.existsSync(envPath)) {
    envPath = `${baseDir}/.env`;
}

console.log(`Loading env vars from: ${envPath}`);
require('dotenv').config({
    path: envPath,
});

export default async function launch(options?) {
    options = options || minimist(process.argv.slice(2));
    if (options.env) {
        const env = options.env instanceof Array ? options.env : options.env.split(',');
        env.forEach(element => {
            const [key, value] = element.split('=');
            const isReference = value.indexOf('process.env.') > -1;
            process.env[key] = isReference ? process.env[value.slice(12)] : value;
        });
    }
    const cmds = options.cmds || process.argv.slice(2).filter(arg => arg.indexOf('--cwd') === -1);
    const cwd = baseDir + (options.cwd ? '/' + options.cwd : '/');

    if (!options.silent) {
        Terminal.text(
            '###############################################################################################################',
            Color.BLUE,
        );
        Terminal.text('#  🚀  Launching   : ' + cmds.join(' '), Color.BLUE);
        Terminal.text('#  📂  CWD         : ' + cwd, Color.BLUE);
        Terminal.text(
            '###############################################################################################################',
            Color.BLUE,
        );
    }
    const stdio = options.stdio !== undefined ? options.stdio : 'inherit';
    const instance = <Instance>spawn(cmds[0], cmds.slice(1), {
        stdio,
        cwd,
        shell: options.shell !== undefined ? options.shell : true,
    });
    instance.name = cmds[0];

    function exit(code) {
        if (instance) {
            console.log('');
            instance.kill(code || 0);
        }
    }

    process.on('SIGINT', <any>exit);

    return new Promise(function(resolve, reject) {
        let lastData = '';
        let lastErrorData = '';
        if (stdio !== 'inherit') {
            instance.stdout.on('data', function(data) {
                lastData = data.toString();
            });
            instance.stderr.on('data', function(data) {
                lastErrorData = data.toString();
            });
        }
        instance.on('close', async code => {
            if (!options.dontExit) {
                console.log(`[${instance.name}] exit code:${code}`);
                process.exit(code);
            } else {
                console.log(`[${instance.name}] exit code:${code}`);
                code === 0 ? resolve(lastData) : reject(lastErrorData);
            }
        });
    });
}
