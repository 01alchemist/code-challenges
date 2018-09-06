import { constructBinaryTree } from '..';
import { printNode } from '../b-tree';

describe('Binary tree test suit', () => {
    test('Basic test 0', () => {
        const input = '';
        const root = constructBinaryTree(input);
        expect(root).toBe(null);
    });
    test('Basic test 1', () => {
        const input = 'test test test';
        const root = constructBinaryTree(input);
        console.log(printNode(root));
        expect(root.occurrenceCount).toBe(3);
    });
    test('Basic test 2', () => {
        const input = 'She had had to address address problems';
        const root = constructBinaryTree(input);
        console.log(printNode(root));
        expect(root.occurrenceCount).toBe(7);
    });
});
