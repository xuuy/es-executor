import {Type} from "./util";

export const IsAccessorDescriptor = function (Desc: AccessorDescriptor) {
  if (Desc === undefined) {
    return false
  }
  if (!Desc['[[Get]]'] && !Desc['[[Set]]']) {
    return false
  }
  return true
};

export const IsDataDescriptor = function(Desc: DataDescriptor) {
  if (Desc === undefined) {
    return false
  }
  if (!Desc['[[Value]]'] && !Desc['[[Writable]]']) {
    return false
  }
  return true
}

export const IsGenericDescriptor = function(Desc: DataDescriptor | AccessorDescriptor) {
  if (Desc === undefined) {
    return false
  }
  if (!IsAccessorDescriptor(Desc) && !IsDataDescriptor(Desc)) {
    return true
  }
  return false
}

export const FromPropertyDescriptor = function(Desc: DataDescriptor | AccessorDescriptor) {
  if (Desc === undefined) {
    return undefined
  }
  let obj = {}
  if (IsDataDescriptor(Desc)) {
    obj['[[DefineOwnProperty]]']('value', {
      '[[Value]]': Desc['[[Value]]'],
      '[[Writable]]': true,
      '[[Enumerable]]': true,
      '[[Configurable]]': true
    }, false)
    obj['[[DefineOwnProperty]]']('writable', {
      '[[Value]]': Desc['[[Writable]]'],
      '[[Writable]]': true,
      '[[Enumerable]]': true,
      '[[Configurable]]': true
    }, false)
  } else if (IsAccessorDescriptor(Desc)) {
    obj['[[DefineOwnProperty]]']('get', {
      '[[Value]]': Desc['[[Get]]'],
      '[[Writable]]': true,
      '[[Enumerable]]': true,
      '[[Configurable]]': true
    }, false)
    obj['[[DefineOwnProperty]]']('set', {
      '[[Value]]': Desc['[[Set]]'],
      '[[Writable]]': true,
      '[[Enumerable]]': true,
      '[[Configurable]]': true
    }, false)
  }
  obj['[[DefineOwnProperty]]']('enumerable', {
    '[[Value]]': Desc['[[Enumerable]]'],
    '[[Writable]]': true,
    '[[Enumerable]]': true,
    '[[Configurable]]': true
  }, false)
  obj['[[DefineOwnProperty]]']('configurable', {
    '[[Value]]': Desc['[[Configurable]]'],
    '[[Writable]]': true,
    '[[Enumerable]]': true,
    '[[Configurable]]': true
  }, false)
  return obj
}

export const ToPropertyDescriptor = function(Obj: LanguageType) {
  if (Type(Obj) !== '[object Object]') {
    throw new TypeError('Obj is not Object')
  }
}