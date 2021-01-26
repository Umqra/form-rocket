import {Input as InputControl} from "./Controls/Input"
import {Array as ArrayControl} from "./Controls/Array"
import {templatify} from "./React/ReactConnect";

export const Input = templatify(InputControl, {kind: "static", tags: {"path": {kind: "fromProp", propName: "path"}}});
export const Array = templatify(ArrayControl, {kind: "array", tags: {"path": {kind: "fromProp", propName: "path"}}});
