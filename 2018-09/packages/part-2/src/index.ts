import { Terminal } from '~common/utils';
const App = require('./app').default;
let app = App();

if (module['hot']) {
    module['hot'].accept('./app', function() {
        const App = require('./app').default;
        app = App();
    });
}
