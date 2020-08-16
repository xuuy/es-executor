/** http://www.ecma-international.org/ecma-262/5.1/index.html#sec-8.12
 * In the following algorithm descriptions, assume O is a native ECMAScript object,
 * P is a String, Desc is a Property Description record, and Throw is a Boolean flag
 */
import {IsAccessorDescriptor, IsDataDescriptor, IsGenericDescriptor} from "../descriptor";

export class InternalObjectMethod {
  O: object
  constructor(value: object) {
    this.O = value
  }

  get ['[[Prototype]]'](): object | null {
    return this.O['[[Prototype]]']
  }

  get ['[[Extensible]]'](): boolean {
    return this.O['[[Extensible]]']
  }

  '[[GetOwnProperty]]'(P: string): PropertyDescriptors | undefined {
    if (!this.O[P]) {
      return undefined
    }
    let D = {}
    let X = this.O[P]
    if (IsDataDescriptor(X)) {
      D['[[Value]]'] = X['[[Value]]']
      D['[[Writable]]'] = X['[[Writable]]']
    } else if (IsAccessorDescriptor(X)) {
      D['[[Get]]'] = X['[[Get]]']
      D['[[Set]]'] = X['[[Set]]']
    }
    D['[[Enumerable]]'] = X['[[Enumerable]]']
    D['[[Configurable]]'] = X['[[Configurable]]']
    return D
  }

  '[[GetProperty]]'(P: string): PropertyDescriptors | undefined {
    let prop = this['[[GetOwnProperty]]'](P)
    if (prop !== undefined) {
      return prop
    }
    let proto = this['[[Prototype]]']
    if (proto === null) {
      return undefined
    }
    return proto['[[GetProperty]]'](P)
  }

  '[[Get]]'(P: string): any {
    // step 1: Let desc be the result of calling the [[GetProperty]] internal method of O with property name P
    let desc = this["[[GetProperty]]"](P)
    // step 2: If desc is undefined, return undefined.
    if (desc === undefined) {
      return undefined
    }
    // step 3: If IsDataDescriptor(desc) is true, return desc.[[Value]]
    if (IsDataDescriptor(desc)) {
      return desc['[[Value]]']
    }
    // step 4: Otherwise, IsAccessorDescriptor(desc) must be true so, let getter be desc.[[Get]]
    let getter = desc['[[Get]]']
    // step 5: If getter is undefined, return undefined.
    if (getter === undefined) {
      return undefined
    }
    // step 6: Return the result calling the [[Call]] internal method of getter providing O as the this value and providing no arguments
    // getter() -> calling [[Call]] internal method of Function Object
    return getter['[[Call]]'](this.O)
  }

  '[[CanPut]]'(P: string): boolean {
    // step 1: Let desc be the result of calling the [[GetOwnProperty]] internal method of O with argument P
    let desc = this["[[GetOwnProperty]]"](P)
    if (desc !== undefined) {
      if (IsAccessorDescriptor(desc)) {
        if (desc['[[Set]]'] === undefined) {
          return false
        }
        return true
      } else {
        return desc['[[Writable]]']
      }
    }
    let proto = this["[[Prototype]]"]
    if (proto === null) {
      return this["[[Extensible]]"]
    }
    let inherited = proto['[[GetProperty]]'](P)
    if (inherited === undefined) {
      return this["[[Extensible]]"]
    }
    if (IsAccessorDescriptor(inherited)) {
      if (inherited['[[Set]]'] === undefined) {
        return false
      }
      return true
    } else {
      if (this["[[Extensible]]"]) {
        return inherited['[Writable]']
      } else {
        return false
      }
    }
  }

  '[[Put]]'(P: string, V: LanguageType, Throw: boolean): void {
    if (!this["[[CanPut]]"](P)) {
      if (Throw) {
        throw new TypeError('cannot set value')
      }
      return
    }
    let ownDesc = this["[[GetOwnProperty]]"](P)
    if (IsDataDescriptor(ownDesc)) {
      let valueDesc = { '[[Value]]': V }
      this["[[DefineOwnProperty]]"](P, valueDesc, Throw)
      return
    }
    let desc = this["[[GetProperty]]"](P)
    if (IsAccessorDescriptor(desc)) {
      let setter = desc['[[Set]]']
      setter['[[Call]]'](this.O, V)
    } else {
      let newDesc = {
        '[[Value]]': V,
        '[[Writable]]': true,
        '[[Enumerable]]': true,
        '[[Configurable]]': true
      }
      this["[[DefineOwnProperty]]"]('P', newDesc, Throw)
    }
    return
  }

  '[[HasProperty]]'(P: string): boolean {
    let desc = this["[[GetProperty]]"](P)
    if (desc === undefined) return false
    return true
  }

  '[[Delete]]'(P: string, Throw: boolean): boolean  {
    let desc = this["[[GetOwnProperty]]"](P)
    if (desc === undefined) {
      return true
    }
    if (desc['[[Configurable]]']) {
      delete this.O[P]
      return true
    } else {
      if (Throw) {
        throw new TypeError('P cannot delete')
      }
      return false
    }
  }

  '[[DefaultValue]]'(hint: any) {

  }

  '[[DefineOwnProperty]]'(P: string, Desc: PropertyDescriptors, Throw: boolean) {
    let current = this["[[GetOwnProperty]]"](P)
    let extensible = this["[[Extensible]]"]
    if (current === undefined && !extensible) {
      if (Throw) {
        throw new TypeError('cannot set property for O.P')
      }
      return false
    }
    if (current === undefined && extensible) {
      if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
        this["[[DefineOwnProperty]]"]('P', {
          '[[Value]]': Desc['[[Value]]'] || undefined,
          '[[Writable]]': Desc["[[Writable]]"] || false,
          '[[Enumerable]]': Desc['[[Enumerable]]'] || false,
          '[[Configurable]]': Desc['[[Configurable]]'] || false,
        }, Throw)
      } else {
        this["[[DefineOwnProperty]]"]('P', {
          '[[Get]]': Desc['[[Get]]'] || undefined,
          '[[Set]]': Desc["[[Set]]"] || undefined,
          '[[Enumerable]]': Desc['[[Enumerable]]'] || false,
          '[[Configurable]]': Desc['[[Configurable]]'] || false,
        }, Throw)
      }
      return true
    }
    return false
  }
}