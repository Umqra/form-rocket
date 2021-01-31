import * as React from "react";

import {ReactFormContext} from "./ReactFormContext";
import {FormPath, ReactPathContext} from "./ReactPathContext";

type Data = {[key: string]: any} | undefined;

export function useFormData(formPath: Partial<FormPath>): [Data, Data, (update: Data) => void, (update: Data) => void] {
    const globalFormPath = React.useContext(ReactPathContext);
    const formTree = React.useContext(ReactFormContext);
    const dataPath = formPath.data != null ? [...globalFormPath.data, ...formPath.data] : undefined;
    const viewPath = formPath.view != null ? [...globalFormPath.view, ...formPath.view] : undefined;
    const [data, setData] = React.useState<Data>(() => {
        if (dataPath != null) {
            return formTree.data.tryGetNode(dataPath).data;
        }
        return undefined;
    });
    const [view, setView] = React.useState<Data>(() => {
        if (viewPath != null) {
            return formTree.view.tryGetNode(viewPath).data;
        }
        return undefined;
    })
    React.useEffect(() => {
        let dataSubscription: () => void | null = null;
        let viewSubscription: () => void | null = null;
        if (dataPath != null) {
            dataSubscription = formTree.data.subscribe(dataPath, {
                notify: (update) => setData(update.data),
                dependencies: [
                    {kind: "data", value: "value"},
                    {kind: "data", value: "validation"},
                    {kind: "data", value: "autoEvaluation"}
                ]
            })
        }
        if (viewPath != null) {
            viewSubscription = formTree.view.subscribe(viewPath, {
                notify: (update) => setView(update.data),
                dependencies: [
                    {kind: "data", value: "visibility"},
                    {kind: "data", value: "value"},
                ]
            })
        }
        return () => {
            if (dataSubscription != null) {
                dataSubscription();
            }
            if (viewSubscription != null) {
                viewSubscription();
            }
        };
    }, [formPath.data?.join("."), formPath.view?.join(".")]);
    return [
        data,
        view,
        (update) => {
            formTree.data.updateNode(dataPath, {data: {value: update}});
        },
        (update: Data) => {
            formTree.view.updateNode(viewPath, {data: {value: update}});
        }
    ];
}
