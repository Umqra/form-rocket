import * as React from "react";

export function Input({value, onChange}: {value: string, onChange: (x: string) => void}) {
    // todo (sivukhin, 25.01.2021): WTF?
    // @ts-ignore
    return <input value={value} onChange={e => onChange(e.target.value)}/>
}
