import {Input as InputControl} from "../controls/Input"
import {Many as ManyControl} from "../controls/Many"
import {Line as LineControl} from "../controls/Line"
import {Label as LabelControl} from "../controls/Label";
import {Section as SectionControl} from "../controls/Section";
import {PathIndex as PathIndexControl} from "../controls/PathIndex";
import {templatify} from "./ReactConnect";

export const Input = templatify(InputControl, {kind: "data-leaf"});
export const Many = templatify(ManyControl, {kind: "data-array"});
export const Line = templatify(LineControl, {kind: "view", tags: {caption: {kind: "fromProp", propName: "caption"}}});
export const Section = templatify(SectionControl, {kind: "view", tags: {caption: {kind: "fromProp", propName: "caption"}}});
export const Label = templatify(LabelControl, {kind: "data-leaf"});
export const PathIndex = templatify(PathIndexControl, {kind: "custom"});