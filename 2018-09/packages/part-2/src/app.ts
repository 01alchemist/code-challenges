/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal } from '~common/utils';

export default function app() {}

if (process.env.NODE_ENV === 'development') {
    if (module['hot']) {
        module['hot'].dispose(function() {
            Terminal.info('Disposed app.ts');
        });
    }
}
