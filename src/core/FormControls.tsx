import * as React from "react";
import * as _ from "lodash";
import {Button as UiButton, Input as UiInput} from "@skbkontur/react-ui";
import {ValidationInfo, ValidationWrapper} from "@skbkontur/react-ui-validations";
import {Accessibility, Form, FormTemplate, FormTemplateId, $} from "./FormState";
import {nanoid} from "nanoid";
import {useStore} from "effector-react";
import {ColumnStack, Fit, RowStack} from "@skbkontur/react-stack-layout";
import {Store} from "effector";

export type DataControlProps<T> = {
    value: T;
    validation: ValidationInfo | null;
    onChange: (value: string) => void;
} & ViewControlProps;

export type ViewControlProps = {
    accessibility: Accessibility;
    onActivate: () => Promise<void>;
    pending: boolean;
};

type InputProps = DataControlProps<string>;
export function Input({value, validation, onChange, accessibility}: InputProps) {
    if (accessibility === "hidden") {
        return null;
    }
    return (
        <ValidationWrapper validationInfo={validation}>
            <UiInput value={value} onValueChange={onChange}/>
        </ValidationWrapper>
    );
}

type SectionProps = {caption: string} & React.PropsWithChildren<ViewControlProps>;
export function Section({caption, accessibility, children}: SectionProps) {
    if (accessibility === "hidden") {
        return null;
    }
    return (
        <ColumnStack gap={2}>
            <Fit><h2>{caption}</h2></Fit>
            {children}
        </ColumnStack>
    );
}

type LineProps = {caption: string} & React.PropsWithChildren<ViewControlProps>;
export function Line({caption, accessibility, children}: LineProps) {
    if (accessibility === "hidden") {
        return null;
    }
    return (
        <RowStack gap={2} verticalAlign="baseline">
            <Fit>{caption}</Fit>
            <Fit>{children}</Fit>
        </RowStack>
    );
}

export type LabelProps = DataControlProps<string>;
export function Label({value, accessibility}: LabelProps) {
    if (accessibility === "hidden") {
        return null;
    }
    return <div>{value}</div>;
}

export type ButtonProps = ViewControlProps & {children?: any};
export function Button({accessibility, onActivate, pending, children}: ButtonProps) {
    return <UiButton disabled={accessibility === "readonly"} loading={pending} onClick={onActivate}>{children}</UiButton>
}

export type Template<TComponent, TKind> = TKind extends "data" ? (
    TComponent extends React.ComponentType<infer TProps> ?
        React.ComponentType<Omit<TProps, keyof (ViewControlProps & DataControlProps<any>)> & ({path: string} | {dataId: string; viewId: string})> :
        never
    ) : (
    TComponent extends React.ComponentType<infer TProps> ?
        React.ComponentType<Omit<TProps, keyof ViewControlProps> & {viewId?: string}> :
        never
    );

export function templatify<TComponent, TKind extends "view" | "data">(component: TComponent, kind: TKind): Template<TComponent, TKind> {
    // @ts-ignore
    component.templateKind = kind;
    // @ts-ignore
    return component;
}

export const InputControl = templatify(Input, "data");
export const LabelControl = templatify(Label, "data");
export const LineControl = templatify(Line, "view");
export const SectionControl = templatify(Section, "view");
export const ButtonControl = templatify(Button, "view");

export const FormContext: React.Context<Form> = React.createContext({
    data: {},
    view: {},
    extract(filter: (props: any) => boolean): Form {
        return this;
    },
    findMatchedParents(node: any, data: any): any {
        return {};
    },
    findRelated(node: any): any[] {
        return [];
    },
    traverse<T>(tree: any, combine: (node: any, stores: Store<T>[]) => Store<T>): Store<T> {
        return combine(tree, []);
    }
});

function ConnectView({viewNode, template, children}: {viewNode: any; template: React.ReactElement; children?: any;}) {
    const accessibility = useStore(viewNode[$].$accessibility);
    const pending = useStore(viewNode[$].activateFx.pending);
    return React.cloneElement(template, {
        accessibility: accessibility,
        onActivate: viewNode[$].activateFx,
        pending: pending,
    }, children);
}

function ConnectData({viewNode, dataNode, template, children}: {viewNode: any, dataNode: any, template: React.ReactElement; children?: any}) {
    const value = useStore(dataNode[$].$value);
    const validation = useStore(dataNode[$].$validation);
    const accessibility = useStore(viewNode[$].$accessibility);
    const pending = useStore(viewNode[$].activateFx.pending);
    return React.cloneElement(template, {
        value: value,
        onChange: dataNode[$].valueChanged,
        validation: validation,
        accessibility: accessibility,
        onActivate: viewNode[$].activateFx,
        pending: pending,
    }, children);
}

export function Connect({viewId, dataId, template, children}: FormTemplateId & {template: React.ReactElement; children?: any}) {
    const form = React.useContext(FormContext);
    const viewNode = _.get(form.view, viewId);
    if (dataId != null) {
        const dataNode = _.get(form.data, dataId);
        return <ConnectData viewNode={viewNode} dataNode={dataNode} template={template}>{children}</ConnectData>
    }
    return <ConnectView viewNode={viewNode} template={template}>{children}</ConnectView>
}

function processReactTemplateInternal(element: React.ReactNode, viewIdPrefix: string, dataIdPrefix: string): {template: FormTemplate[], react: React.ReactNode} {
    if (React.isValidElement(element)) {
        const elementType: any = element.type;
        const kind: "view" | "data" | undefined = elementType.templateKind;
        const {children} = element.props || {};
        if (kind === "view") {
            const currentId = nanoid(8);
            const viewId = element.props.viewId || (viewIdPrefix == "" ? currentId : [viewIdPrefix, currentId].join("."));
            const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, viewId, dataIdPrefix));
            return {
                template: [
                    {
                        viewId: viewId,
                        children: processed.map(x => x.template).flat(),
                        props: element.props
                    }
                ],
                react: React.createElement(Connect, {
                    viewId: viewId,
                    template: element,
                }, processed.map(x => x.react))
            }
        } else if (kind === "data") {
            const currentId = element.props.path;
            const viewId = viewIdPrefix == "" ? currentId : [viewIdPrefix, currentId].join(".");
            const dataId = dataIdPrefix == "" ? currentId : [dataIdPrefix, currentId].join(".");
            const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, viewId, dataId));
            return {
                template: [
                    {
                        viewId: viewId,
                        dataId: dataId,
                        children: processed.map(x => x.template).flat(),
                        props: element.props,
                    }
                ],
                react: React.createElement(Connect, {
                    viewId: viewId,
                    dataId: dataId,
                    template: element,
                }, processed.map(x => x.react))
            }
        }
        const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, viewIdPrefix, dataIdPrefix));
        return {
            template: processed.map(x => x.template).flat(),
            react: React.cloneElement(element, {}, processed.map(x => x.react))
        }
    } else if (element == null || typeof element == "string" || typeof element == "number" || typeof element == "boolean") {
        return {
            template: [],
            react: element
        };
    }
    throw new Error(`unexpected ReactNode: ${element}`)
}

export function processReactTemplate(element: React.ReactNode): { template: FormTemplate; react: React.ReactNode; } {
    const {template, react} = processReactTemplateInternal(element, "", "");
    return {template: {viewId: "", children: template, props: {}}, react};
}
