/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal } from '~common/utils';
import { parse } from './parser';

let fileBrowser;
let fileBrowserBtn;
let inputField;
let outputField;

export default function app() {
    inputField = <HTMLInputElement>document.getElementById('input-field');
    outputField = <HTMLInputElement>document.getElementById('output-field');
    fileBrowser = <HTMLInputElement>document.getElementById('file-browser');
    fileBrowserBtn = <HTMLInputElement>document.getElementById('file-browser-btn');
    fileBrowser.addEventListener('change', handleFileUpload, false);
    fileBrowserBtn.addEventListener('click', triggerFileBrowse, false);
}

const mapper = value => ({ value: +value });
const columnMapping = [mapper, mapper, mapper];

const triggerFileBrowse = e => {
    e.stopPropagation();
    fileBrowser.click();
};

function handleFileUpload() {
    if (!fileBrowser) {
        Terminal.error("Couldn't find the fileinput element");
    } else if (!fileBrowser.files) {
        Terminal.error("This browser doesn't seem to support the `files` property of file inputs");
    } else if (!fileBrowser.files[0]) {
        Terminal.error("Please select a file before clicking 'Load'");
    } else {
        const file = fileBrowser.files[0];
        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const input = fileReader.result;
            const { rows, originalRows } = await parse(input, {
                columnMapping,
                regenerateMissingData: true,
            });
            let maxValue = 0;
            rows.forEach(row =>
                row.forEach(c => {
                    maxValue = maxValue < c ? c : maxValue;
                }),
            );
            const pad = maxValue.toString().length + 2;

            inputField.innerHTML = originalRows
                .map(row => row.map(i => i.toString().padStart(pad, ' ')).join(','))
                .join('\n');
            outputField.innerHTML = rows.map(row => row.map(i => i.toString().padStart(pad, ' ')).join(',')).join('\n');
        };
        fileReader.readAsText(file);
    }
}

if (process.env.NODE_ENV === 'development') {
    if (module['hot']) {
        module['hot'].dispose(function() {
            if (fileBrowser) {
                fileBrowser.removeEventListener('change', handleFileUpload);
                fileBrowserBtn.removeEventListener('click', triggerFileBrowse);
                Terminal.info('App disposed');
            }
        });
    }
}
