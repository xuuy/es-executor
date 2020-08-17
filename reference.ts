/*! =================== Reference ==================
 * http://www.ecma-international.org/ecma-262/5.1/index.html#sec-8.7
 */

import {toObject} from "./Language-Type/convert-type";
import {IsAccessorDescriptor, IsDataDescriptor} from "./descriptor";
import {Type} from "./util";

export function Reference(value: Reference['base'], name: string, strict: boolean): Reference {
    return {
        base: value,
        name,
        strict
    }
}

export const GetBase: GetBase = function (V) {
    return V.base
}

export const GetReferencedName: GetReferencedName = function (V) {
    return V.name
}

export const IsStrictReference: IsStrictReference = function (V) {
    return V.strict
}

export const HasPrimitiveBase: HasPrimitiveBase = function (V) {
    return (V.base instanceof String || V.base instanceof Number || V.base instanceof Boolean)
}

export const IsPropertyReference: IsPropertyReference = function (V) {
    return V.base instanceof Object || HasPrimitiveBase(V)
}

export const IsUnresolvableReference: IsUnresolvableReference = function (V) {
    return V.base === undefined
}

export function GetValue(V: any) {
    // step 1: Type(V) is not Reference, return V
    if (Type(V) !== '[object Reference]') {
        return V
    }
    // step2: Let base be the result of calling GetBase(V).
    let base = GetBase(V)
    // step 3: If IsUnresolvableReference(V), throw a ReferenceError exception.
    if (IsUnresolvableReference(V)) {
        return new ReferenceError('V is Unresolved Reference!')
    }
    // step 4: If IsPropertyReference(V), then
    if (IsPropertyReference(V)) {
        // step 4.1: If HasPrimitiveBase(V) is false, then let get be the [[Get]] internal method of base
        // otherwise let get be the special [[Get]] internal method defined below.
        if (!HasPrimitiveBase(V)) {
            let get = base['[[Get]]']
            // step 4.2: Return the result of calling the get internal method using base as its this value,
            // and passing GetReferencedName(V) for the argument
            return GetReferencedName(get(base))
        } else {
            // step 1: Let O be ToObject(base).
            let O = toObject(base)
            // step 2: Let desc be the result of calling the [[GetProperty]] internal method of O with property name P
            let desc = O['[[GetProperty]]']('P')
            // step 3: If desc is undefined, return undefined
            if (desc === undefined) {
                return undefined
            }
            // step 4: If IsDataDescriptor(desc) is true, return desc.[[Value]]
            if (IsDataDescriptor(desc)) {
                return desc['[[Value]]']
            }
            // step 5: Otherwise, IsAccessorDescriptor(desc) must be true so, let getter be desc.[[Get]]
            if (IsAccessorDescriptor(desc)) {
                let getter = desc['[[Get]]']
                // step 6: If getter is undefined, return undefined.
                if (getter === undefined) {
                    return undefined
                }
                // step 7: Return the result calling the [[Call]] internal method of getter providing base as the this value and providing no arguments.
                return getter['[[Call]]'](base)
            }
        }
    } else {
        // step 5: Else, base must be an environment record
        // step 5.1: Return the result of calling the GetBindingValue (see 10.2.1) concrete method
        // of base passing GetReferencedName(V) and IsStrictReference(V) as arguments.
        return (base as EnvironmentRecord).GetBindingValue(GetReferencedName(V), IsStrictReference(V))
    }
}