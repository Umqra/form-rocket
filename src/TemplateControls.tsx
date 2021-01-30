import {Input as InputControl} from "./controls/Input"
import {Array as ArrayControl} from "./controls/Array"
import {templatify} from "./react/ReactConnect";

export const Input = templatify(InputControl, {kind: "data-leaf"});
export const Array = templatify(ArrayControl, {kind: "data-array"});
