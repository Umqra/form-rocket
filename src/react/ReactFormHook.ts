import * as React from "react";

import {Path} from "../core/Tree";

import {ReactFormContext} from "./ReactFormContext";
import {ReactPathContext} from "./ReactPathContext";

type Data = {[key: string]: any};

export function useFormData(relativePath: Path): [Data, (update: Data) => void] {
    const globalPath = React.useContext(ReactPathContext);
    const dataTree = React.useContext(ReactFormContext);
    const nodePath = [...globalPath, ...relativePath];
    const [data, setData] = React.useState<Data>(() => dataTree.tryGetNode(nodePath)?.data);
    React.useEffect(() => {
        return dataTree.subscribe(nodePath, {
            update: (update) => setData(update.data.value),
            dependencies: [
                {kind: "data", value: "value"},
                {kind: "data", value: "accessibility"},
                {kind: "data", value: "validation"},
                {kind: "data", value: "autoEvaluation"}
            ],
        });
    }, [nodePath.join(".")]);
    return [
        data,
        (update) => dataTree.updateNode(nodePath, {data: update})
    ];
}
