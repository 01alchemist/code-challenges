import * as fs from 'fs';
import * as path from 'path';
import { parse } from './csv-parser';
const heavyInputComma = fs.readFileSync(path.resolve(__dirname, './__mocks__/test-data-comma.csv'), 'utf-8');
const heavyInputSpace = fs.readFileSync(path.resolve(__dirname, './__mocks__/test-data-space.csv'), 'utf-8');

const mapper = value => ({ value: +value });
const columnMapping = [mapper, mapper, mapper];

describe('CSV Parser test suit', () => {
    test('It should parse basic csv with space delimiter', async done => {
        const input = `2 4 99`;
        const expected = [{ 0: 2, 1: 4, 2: 99 }];
        const { rows: output } = await parse(input, { delimiter: ' ', columnMapping, emitObject: true });
        expect(output).toEqual(expected);
        done();
    });

    test('It should parse basic csv with comma delimiter', async done => {
        const input = `2,4,99`;
        const expected = [{ 0: 2, 1: 4, 2: 99 }];
        const { rows: output } = await parse(input, { delimiter: ',', columnMapping, emitObject: true });
        expect(output).toEqual(expected);
        done();
    });

    test('It should parse multi row csv with space delimiter', async done => {
        const input = `2 4 99
2 4 99
2 4 99
2 4 99
2 4 99
`;
        const row = { 0: 2, 1: 4, 2: 99 };
        const expected = [row, row, row, row, row];
        const { rows: output } = await parse(input, { delimiter: ' ', columnMapping, emitObject: true });
        expect(output).toEqual(expected);
        done();
    });

    test('It should parse multi row csv with comma delimiter', async done => {
        const input = `2,4,99
2,4,99
2,4,99
2,4,99
2,4,99
`;
        const row = { 0: 2, 1: 4, 2: 99 };
        const expected = [row, row, row, row, row];
        const { rows: output } = await parse(input, { delimiter: ',', columnMapping, emitObject: true });
        expect(output).toEqual(expected);
        done();
    });

    test('It should filter bad values with space delimiter', async done => {
        const input = `3 0 5`;
        const expected = [[3, 4, 5]];
        const { rows: output } = await parse(input, { delimiter: ' ', columnMapping, emitObject: false });
        expect(output).toEqual(expected);
        done();
    });

    test('It should filter multi row bad values with space delimiter', async done => {
        const input = `
2 4 99
2 1 99
3 0 5
2 3 99
2 4 99
`;
        const expected = [[2, 4, 99], [2, 1, 99], [3, 3, 5], [2, 3, 99], [2, 4, 99]];
        const { rows: output } = await parse(input, { delimiter: ' ', columnMapping, emitObject: false });
        expect(output).toEqual(expected);
        done();
    });

    test('It should filter bad values with comma delimiter', async done => {
        const input = `3,0,5`;
        const expected = [[3, 4, 5]];
        const { rows: output } = await parse(input, { delimiter: ',', columnMapping, emitObject: false });
        expect(output).toEqual(expected);
        done();
    });

    test('It should filter multi row bad values with comma delimiter', async done => {
        const input = `
2,4,99
2,1,99
3,0,5
2,3,99
2,4,99
`;
        const expected = [[2, 4, 99], [2, 1, 99], [3, 3, 5], [2, 3, 99], [2, 4, 99]];
        const { rows: output } = await parse(input, { delimiter: ',', columnMapping, emitObject: false });
        expect(output).toEqual(expected);
        done();
    });

    test('It should filter heavy bad values with comma delimiter', async done => {
        const { rows: output } = await parse(heavyInputComma, { delimiter: ',', columnMapping, emitObject: false });
        expect(output).toMatchSnapshot();
        done();
    });

    test('It should filter heavy bad values with space delimiter', async done => {
        const { rows: output } = await parse(heavyInputSpace, { delimiter: ',', columnMapping, emitObject: false });
        expect(output).toMatchSnapshot();
        done();
    });
});
