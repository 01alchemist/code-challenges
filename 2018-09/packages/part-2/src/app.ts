import { Terminal } from '~common/utils';

export default function app() {
    console.log('test5');
}

if (module['hot']) {
    module['hot'].dispose(function() {
        Terminal.info('Disposed app.ts');
    });
}
