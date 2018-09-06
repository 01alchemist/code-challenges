/**
 * Author : Nidin Vinayakan <01@01alchemist.com>
 */
import { Terminal } from '~common/utils';

type ParserOptions = {
    delimiter?: string | RegExp;
    emitObject?: boolean;
    regenerateMissingData?: boolean;
    columnMapping?;
};
/**
 * Parse CSV from utf-8 string or Buffer
 * @param data
 * @param options
 */
export async function parse(data, options: ParserOptions = {}) {
    if (!data || data == '') {
        throw 'Invalid input data!';
    }
    if (!options.delimiter) {
        const stringData = data.toString('utf-8');
        const firstLine =
            stringData.indexOf('\n') == -1 ? stringData : stringData.substring(0, stringData.indexOf('\n'));
        const cl = firstLine.split(',');
        const scl = firstLine.split(';');
        const sl = firstLine.split(' ');
        if (firstLine.indexOf(',') > -1 && cl >= sl) {
            options.delimiter = ',';
        } else if (firstLine.indexOf(';') > -1 && scl >= sl) {
            options.delimiter = ';';
        } else if (firstLine.indexOf(' ') > -1) {
            options.delimiter = ' ';
        }
        Terminal.warn(`No delimiter provided, Delimiter inferred to '${options.delimiter}' from input data`);
    }
    const parser = new Parser(options);
    return new Promise<Parser>(function(resolve, reject) {
        parser._write(data, 'utf-8', () => {
            resolve(parser);
        });
    });
}
/**
 * Parse CSV from readable stream
 * @param readStream
 * @param options
 */
export async function parseStream(readStream, options: ParserOptions = {}) {
    if (!readStream || !readStream.pipe) {
        throw 'Input is not a stream!';
    }
    const parser = new Parser(options);
    readStream.pipe(parser);
    return new Promise(function(resolve, reject) {
        parser.on('finish', () => {
            resolve(parser);
        });
    });
}

const defaultParserOptions = {
    delimiter: ',',
    emitObject: false,
    regenerateMissingData: true,
    columnMapping: null,
};
self['Writable'] =
    self['Writable'] ||
    class {
        on() {}
    };
/**
 * CSV parser with stream support
 */
class Parser extends self['Writable'] {
    rows: any[];
    originalRows: any[];
    private _options: ParserOptions;
    constructor(options: ParserOptions = defaultParserOptions) {
        super();
        this._options = {
            ...defaultParserOptions,
            ...options,
        };

        this.reset();
        super.on('finish', _ => console.log('finished'));
    }
    reset() {
        this.rows = [];
    }
    _write(chunk: Buffer, encoding = 'utf-8', callback?) {
        const _rows = chunk
            .toString(encoding)
            .split('\n')
            .filter(item => item !== '');
        const delimiter = this._options.delimiter || ',';
        const rows = _rows.map(row => mapColumns(row.split(delimiter), this._options.columnMapping, this._options));
        this.rows.push.apply(this.rows, rows);
        if (this._options.regenerateMissingData) {
            this.originalRows = this.rows.map(item => (item instanceof Array ? item.concat() : { ...item }));
            let loop;
            let maxDepth = 2;
            // Interpolating invalid data from the surrounding values
            do {
                loop = this.rows.some((row, x) => {
                    if (row instanceof Array) {
                        return row.some((column, y) => {
                            if (column) {
                                return false;
                            }
                            // Interpolating all falsy values [0,null,undefined,'',false]
                            const [sum, depth] = calcSum(this.rows, 0, x, y);

                            if (depth === maxDepth) {
                                this.rows[x][y] = sum / depth;
                                maxDepth = 2;
                                return true;
                            }
                            return false;
                        });
                    } else {
                        const [keys, values] = extractKeyValues(row);
                        return values.some((column, y) => {
                            if (column) {
                                return false;
                            }
                            // Interpolating all falsy values [0,null,undefined,'',false]
                            const [sum, depth] = calcSum(this.rows, 0, x, y, keys);
                            if (depth === maxDepth) {
                                this.rows[x][keys[y]] = sum / depth;
                                maxDepth = 2;
                                return true;
                            }
                            return false;
                        });
                        return false;
                    }
                });
                if (!loop && maxDepth < 4) {
                    maxDepth++;
                    loop = true;
                }
            } while (loop);
        } else {
            this.originalRows = this.rows;
        }
        if (callback) callback();
    }

    _final(callback) {
        console.log('_final');
    }
}

const extractKeyValues = obj => {
    let keys: string[] = [];
    let values: any[] = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
            values.push(obj[key]);
        }
    }
    return [keys, values];
};

const adjacent = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
const calcSum = (rows, depth, x, y, keys?) => [
    adjacent.reduce((acc, offset) => {
        var value = (rows[x + offset.x] || [])[keys ? keys[y + offset.y] : y + offset.y];
        return !value ? acc : (depth++, acc + value);
    }, 0),
    depth,
];

function mapColumns(row, columnMapping, options) {
    let data: any = options.emitObject ? {} : [];
    row.forEach((c, i) => {
        const mapper = columnMapping ? columnMapping[i] : null;
        if (mapper) {
            const mapping = mapper(c);
            if (options.emitObject) {
                if (mapping && mapping.name && mapping.name.indexOf(',') > -1) {
                    const fields = mapping.name.split(',');
                    fields.forEach((field, i) => {
                        data[field] = mapping.value[i];
                    });
                } else if (mapping && mapping.name && mapping.name.indexOf('.') > -1) {
                    const path = mapping.name.split('.');
                    const parentKey = path.shift();
                    let parent;
                    if (data[parentKey]) {
                        parent = data[parentKey];
                    } else {
                        parent = {};
                        data[parentKey] = parent;
                    }
                    let lastChild;
                    path.forEach(element => {
                        if (lastChild) parent = lastChild;
                        if (parent[element]) {
                            lastChild = parent[element];
                        } else {
                            lastChild = {};
                            parent[element] = lastChild;
                        }
                    });
                    parent[path[path.length - 1]] = mapping.value;
                } else {
                    const name = mapping.name || i;
                    if (data[name]) {
                        if (typeof mapping.value === 'function') {
                            const existingValue = data[name];
                            const value = mapping.value(existingValue);
                            if (value) {
                                data[name] = value;
                            }
                        } else {
                            if (mapping.value) {
                                data[name] = mapping.value;
                            }
                        }
                    } else {
                        if (typeof mapping.value === 'function') {
                            const value = mapping.value();
                            if (value) {
                                data[name] = value;
                            }
                        } else {
                            data[name] = mapping.value;
                        }
                    }
                }
            } else {
                if (typeof mapping.value === 'function') {
                    const value = mapping.value();
                    if (value) {
                        data[i] = value;
                    }
                } else {
                    data[i] = mapping.value;
                }
            }
        } else {
            data[i] = c;
        }
    });
    return data;
}
