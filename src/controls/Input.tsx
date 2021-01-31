import {Input as UiInput} from "@skbkontur/react-ui";
import {ValidationWrapper, ValidationInfo} from "@skbkontur/react-ui-validations";
import * as React from "react";

export function Input({value, visibility, validation, onChange}: {
    value: string | number | undefined,
    visibility: string,
    validation: ValidationInfo,
    onChange: (x: string | number | undefined) => void
}) {
    if (visibility === "hidden") {
        return null;
    } else if (visibility === "read-only") {
        return <span>{value} (read-only)</span>
    }
    if (typeof value === "string") {
        return (
            <ValidationWrapper validationInfo={validation}>
                <UiInput value={value} onValueChange={onChange}/>
            </ValidationWrapper>
        );
    }
    return (
        <ValidationWrapper validationInfo={validation}>
            <UiInput value={value == null ? "" : value.toString()} onValueChange={x => onChange(x === "" ? undefined : parseInt(x))}/>
        </ValidationWrapper>
    );
}
