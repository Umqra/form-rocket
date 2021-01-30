import {Input as InputControl} from "./controls/Input"
import {Array as ArrayControl} from "./controls/Array"
import {Line as LineControl} from "./controls/Line"
import {Label as LabelControl} from "./controls/Label";
import {templatify} from "./react/ReactConnect";

export const Input = templatify(InputControl, {kind: "data-leaf"});
export const Array = templatify(ArrayControl, {kind: "data-array"});
export const Line = templatify(LineControl, {kind: "view", tags: {caption: {kind: "fromProp", propName: "caption"}}});
export const Label = templatify(LabelControl, {kind: "data-leaf"});