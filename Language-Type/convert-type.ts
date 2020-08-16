/** http://www.ecma-international.org/ecma-262/5.1/index.html#sec-9.9 */
export function toObject (argument: LanguageType): object {
    if (argument === undefined) {
        return new TypeError('argument can not convert to object')
    }
    if (argument === null) {
        return new TypeError('argument can not convert to object')
    }
    if (argument instanceof Boolean) {
        return new Boolean(argument)
    }
    if (argument instanceof Number) {
        return new Number(argument)
    }
    if (argument instanceof String) {
        return new String(argument)
    }
    return argument as object
}