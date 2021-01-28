import * as React from "react";
import {FormTemplateKind} from "../FormTemplate";
import {useFormData} from "./ReactFormHook";
import {ReactPathContext} from "./ReactPathContext";
import {configureComponent, ReactTemplateConfiguration} from "./ReactTemplateProcessor";

interface ConnectProps {
    nodePath: string[];
    kind: FormTemplateKind;
    template: React.ReactElement;
}

// todo (sivukhin, 25.01.2021): Add lambda-like path
type TryAddPath<TProps, TExclude extends keyof any> = Omit<TProps, TExclude> & {path: string[]};

export type Template<TComponent> = TComponent extends React.ComponentType<infer TProps> ?
    React.ComponentType<TryAddPath<TProps, "value" | "accessibility" | "validation" | "autoEvaluation" | "onChange">> :
    never;

export function templatify<TComponent>(component: TComponent, configuration: ReactTemplateConfiguration): Template<TComponent> {
    // @ts-ignore
    return configureComponent(component, configuration);
}

function ConnectArray(props: Omit<ConnectProps, "kind"> & {children: React.ReactElement}) {
    const [data, ] = useFormData(props.nodePath);
    const childrenIds = data.value;
    const wrapped = childrenIds.map((x: string) => <ReactPathContext.Provider value={[...props.nodePath, x]}>{props.children}</ReactPathContext.Provider>);
    return React.cloneElement(props.template, {
        accessibility: data.accessibility,
        validation: data.validation,
    }, wrapped);
}

function ConnectStatic(props: Omit<ConnectProps, "kind"> & {children: React.ReactNode}) {
    const [data, setData] = useFormData(props.nodePath);
    return React.cloneElement(props.template, {
        value: data.value,
        onChange: (x: any) => setData({value: x}),
        accessibility: data.accessibility,
        validation: data.validation,
        autoEvaluation: data.autoEvaluation,
    }, props.children);
}


export function Connect({kind, children, ...props}: ConnectProps & {children?: any}) {
    if (kind === "array") {
        return <ConnectArray {...props}>{children}</ConnectArray>;
    } else if (kind === "static") {
        return <ConnectStatic {...props}>{children}</ConnectStatic>;
    }
}