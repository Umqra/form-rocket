import * as React from "react";
import {FormTemplateKind} from "../FormTemplate";
import {useFormData} from "./ReactFormHook";
import {ReactPathContext} from "./ReactPathContext";
import {configureComponent, ReactTemplateConfiguration} from "./ReactTemplateProcessor";
import {Path} from "../core/Tree";

interface ConnectProps {
    kind: FormTemplateKind;
    viewPath: Path;
    dataPath?: Path;
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

function ConnectView(props: Omit<ConnectProps, "kind" | "dataPath"> & {children: React.ReactNode}) {
    const [, view] = useFormData({view: props.viewPath});
    return React.cloneElement(props.template, {
        accessibility: view.accessibility,
    }, props.children);
}

function ConnectDataArray(props: Omit<ConnectProps, "kind"> & {children: React.ReactElement}) {
    const globalFormPath = React.useContext(ReactPathContext);
    const [data, ] = useFormData({data: props.dataPath, view: props.viewPath});
    const childrenIds = data.value;
    const wrapped = childrenIds.map((x: string) => (
        <ReactPathContext.Provider value={{
            data: [...globalFormPath.data, ...props.dataPath, x],
            view: [...globalFormPath.view, ...props.viewPath, x]
        }}>
            {props.children}
        </ReactPathContext.Provider>
    ));
    return React.cloneElement(props.template, {
        accessibility: data.accessibility,
        validation: data.validation,
    }, wrapped);
}

function ConnectDataLeaf(props: Omit<ConnectProps, "kind"> & {children: React.ReactNode}) {
    const [data, view, setData] = useFormData({data: props.dataPath, view: props.viewPath});
    return React.cloneElement(props.template, {
        value: data.value,
        onChange: (x: any) => setData({value: x}),
        validation: data.validation,
        autoEvaluation: data.autoEvaluation,
        accessibility: view.accessibility,
    }, props.children);
}


export function Connect({kind, children, ...props}: ConnectProps & {children?: any}) {
    if (kind === "view") {
        return <ConnectView {...props}>{children}</ConnectView>;
    } else if (kind === "data-array") {
        return <ConnectDataArray {...props}>{children}</ConnectDataArray>;
    } else if (kind === "data-leaf") {
        return <ConnectDataLeaf {...props}>{children}</ConnectDataLeaf>;
    }
}