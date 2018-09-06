/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal } from '~common/utils';
const App = require('./app').default;
App();
Terminal.info('App initialized');

if (process.env.NODE_ENV === 'development') {
    if (module['hot']) {
        module['hot'].accept('./app', function() {
            const App = require('./app').default;
            App();
            Terminal.info('App hot reloaded');
        });
    }
}
