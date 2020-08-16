import {InternalObjectMethod} from "./internal";

/** 与原生Object区分 */
export class Object$ extends InternalObjectMethod{
  constructor(value?: any) {
    ToObject(value)
    super(value)
  }
}