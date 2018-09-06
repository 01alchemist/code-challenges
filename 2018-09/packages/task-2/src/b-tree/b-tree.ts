import { Terminal } from '~common/utils';
const chalk = require('chalk');

class Node {
    isRoot: boolean;
    constructor(public occurrenceCount: number = 0, public value?: string, public left?: Node, public right?: Node) {}
}

/**
 * Construct unbalanced binary tree
 * @param data string
 */
export function constructBinaryTree(data: string) {
    // Split by new line and space then filter out empty values
    const words = data.split(/\n| /gi).filter(item => item !== '');
    if (words.length === 0) {
        Terminal.warn('No words found in the input');
        return null;
    }
    // Create word occurrence map
    const occurrenceMap = new Map<string, number>();
    words.forEach(word => {
        const existingWord = occurrenceMap.get(word);
        occurrenceMap.set(word, existingWord ? existingWord + 1 : 1);
    });
    // Sort words by occurrence count
    words.sort((a, b) => {
        const ao = occurrenceMap.get(a) || 0;
        const bo = occurrenceMap.get(b) || 0;
        return ao - bo;
    });
    // Create unique word set
    const wordSet = new Set(words);
    var root;
    let stack: string[] = [];
    let previousNode, currentParent;
    // Start building unbalanced b-tree
    wordSet.forEach((word, i) => {
        stack.push(word);

        if (stack.length == 2) {
            if (!previousNode) {
                const a = stack.shift() || '';
                const b = stack.shift() || '';
                const ao = occurrenceMap.get(a) || 0;
                const bo = occurrenceMap.get(b) || 0;
                const left = new Node(ao, a);
                const right = new Node(bo, b);
                currentParent = new Node(ao + bo, '', left, right);
            } else if (previousNode) {
                const [a, b] = stack;
                const ao = occurrenceMap.get(a) || 0;
                const bo = occurrenceMap.get(b) || 0;
                let left, right;
                if (ao != bo) {
                    left = previousNode;
                    right = new Node(ao, a);
                    currentParent = new Node(ao + previousNode.occurrenceCount, '', left, right);
                    stack.shift();
                } else {
                    left = new Node(ao, a);
                    right = new Node(bo, b);
                    currentParent = new Node(ao + bo);
                    stack.pop();
                    stack.pop();
                    currentParent.left = left;
                    currentParent.right = right;
                    const previousParent = currentParent;
                    currentParent = new Node(
                        previousNode.occurrenceCount + previousParent.occurrenceCount,
                        '',
                        previousNode,
                        previousParent,
                    );
                }
            }
            previousNode = currentParent;
        }
    });

    if (stack.length > 0) {
        const a = stack.pop() || '';
        const ao = occurrenceMap.get(a) || 0;
        if (currentParent) {
            const previousParent = currentParent;
            const left = previousParent;
            const right = new Node(ao, a);
            currentParent = new Node(ao + previousParent.occurrenceCount, '', left, right);
        } else {
            currentParent = new Node(ao, a);
        }
    }

    root = currentParent;
    root.isRoot = true;
    return root;
}

export function printNode(node?: Node, branch: string = '', isLeft?: boolean, isRoot?: boolean) {
    if (node != null) {
        isRoot = isRoot !== undefined && isRoot !== null ? isRoot : node.isRoot;
        const leaf: string = !node.value ? '' : ` -> ${node.value}`;
        const nextBranch: string = branch + (isLeft ? ' │  ' : '    ');

        let str = `${branch} ${isLeft ? '├──' : isRoot ? '   ' : '└──'}${chalk.gray.bgBlue(
            ` ${node.occurrenceCount} `,
        )}${leaf}\n`;
        str += printNode(node.left, nextBranch, true, false);
        str += printNode(node.right, nextBranch, false, false);
        return chalk.blue(str);
    } else {
        return '';
    }
}
