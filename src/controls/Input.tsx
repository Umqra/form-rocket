import {Input as UiInput} from "@skbkontur/react-ui";
import * as React from "react";

export function Input({value, visibility, onChange}: {value: string, visibility: string, onChange: (x: string) => void}) {
    if (visibility === "hidden") {
        return null;
    } else if (visibility === "read-only") {
        return <span>{value} (read-only)</span>
    }
    return <UiInput value={value} onValueChange={onChange}/>
}
