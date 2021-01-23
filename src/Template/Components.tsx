import * as React from "react";
import {FormEngineContext} from "../React/FormEngineContext";
import {NodeId} from "../FormDataTree";
import {useFormEngineData} from "../React/FormEngineHooks";

export function withTag<TProps>(
    component: React.ComponentType<TProps>,
    tagName: string,
    options: {fromProp?: keyof TProps, fromValue?: string}
) {
    // @ts-ignore
    component.__tags__ = (component.__tags__ || []).push([tagName, options]);
    return component;
}

export type Accessibility = "hidden" | "read-only" | "full-access";
export type Validation = string;

export interface FormEngineFieldData<TValue> {
    value: TValue;
    onChange(value: TValue): void;
    accessibility?: Accessibility;
    validation?: Validation;
    autoEvaluation?: TValue;
}

export function ConnectComponent<TComponent>(
    {nodeId, children, ...rest}: {
        nodeId: NodeId,
        children: TComponent extends React.ReactElement<infer P> ?
            (P extends FormEngineFieldData<infer V> ? TComponent : never) :
            never
    }
) {
    const formEngine = React.useContext(FormEngineContext);
    const [data, setData] = useFormEngineData(nodeId);
    return React.cloneElement(children, {
        ...rest,
        onChange: (value: any) => setData({value: value}),
        onAppendChild: (value: any) => {
            formEngine.addNode([...nodeId, )
        },
        value: data.value,
        accessibility: data.accessibility,
        validation: data.validation,
        autoEvaluations: data.autoEvaluations
    })
}
