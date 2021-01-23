import * as React from "react";

type TryAddPath<TProps, TExclude extends keyof any> = TProps extends {value: infer V} ?
    Omit<TProps, TExclude> & {path: () => V} :
    TProps;

export type Template<TComponent> = TComponent extends React.ComponentType<infer TProps> ?
    React.ComponentType<TryAddPath<TProps, "value" | "accessibility" | "validation" | "autoEvaluations" | "onChange" | "nodeId">> :
    never;

export function templatify<TComponent>(component: TComponent): Template<TComponent> {
    // @ts-ignore
    return component;
}
