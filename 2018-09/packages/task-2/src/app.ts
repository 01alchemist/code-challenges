/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal } from '~common/utils';
import { printNode, constructBinaryTree } from './b-tree';

export default function app(input: string | Buffer, print = true) {
    const data = input.toString();
    Terminal.time(' Tree built in');
    const root = constructBinaryTree(data);
    Terminal.timeEnd(' Tree built in');
    if (print) {
        console.log('');
        console.log(printNode(root));
    }
}

if (process.env.NODE_ENV === 'development') {
    if (module['hot']) {
        module['hot'].dispose(function() {
            Terminal.info('App disposed');
        });
    }
}
