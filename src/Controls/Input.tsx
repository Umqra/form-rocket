import * as React from "react";

export function Input({value, onChange}: {value: string, onChange: (x: string) => void}) {
    return <input value={value} onChange={e => onChange(e.target.value)}/>
}
