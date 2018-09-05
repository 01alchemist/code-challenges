import { Terminal } from '~common/utils';
const App = require('./app').default;
App();

if (module['hot']) {
    module['hot'].accept('./app', function() {
        const App = require('./app').default;
        App();
    });
}
