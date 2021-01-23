import {Input as InputControl} from "./Controls/Input"
import {templatify} from "./Template/Template"
import {Array as ArrayControl} from "./Template/Components";

export const Input = templatify(InputControl);
export const Array = templatify(ArrayControl);
