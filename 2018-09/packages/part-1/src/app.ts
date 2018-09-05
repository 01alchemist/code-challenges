import { Terminal } from '~common/utils';
import { parse } from './parser';

let fileBrowser;
let inputField;
let outputField;
export default function app() {
    inputField = <HTMLInputElement>document.getElementById('input-field');
    outputField = <HTMLInputElement>document.getElementById('output-field');
    fileBrowser = <HTMLInputElement>document.getElementById('file-browser');
    fileBrowser.addEventListener('change', handleFileUpload, false);
}

const mapper = value => ({ value: +value });
const columnMapping = [mapper, mapper, mapper];

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
                delimiter: ',',
                columnMapping,
                regenerateMissingData: true,
            });
            console.log(rows);
            // inputField.innerHTML = input;
            inputField.innerHTML = originalRows
                .map(row => row.map(i => i.toString().padStart(4, ' ')).join(','))
                .join('\n');
            outputField.innerHTML = rows.map(row => row.map(i => i.toString().padStart(4, ' ')).join(',')).join('\n');
        };
        fileReader.readAsText(file);
    }
}

if (module['hot']) {
    module['hot'].dispose(function() {
        Terminal.info('Disposed app.ts');
    });
}
