import * as React from "react";

import {NodeId} from "../FormDataTree";

import {FormEngineContext} from "./FormEngineContext";

export function useFormEngineData(nodeId: NodeId): [{ [key: string]: any }, (update: { [key: string]: any }) => void] {
    const formEngine = React.useContext(FormEngineContext);
    const [data, setData] = React.useState<{ [key: string]: any }>(() => formEngine.tryGetNode(nodeId)?.data);
    React.useEffect(() => {
        return formEngine.subscribe(nodeId, {
            update: (_, update) => setData(update.data),
            dependencies: ["value", "accessibility", "validation", "autoEvaluation"],
        });
    }, [nodeId.join(".")]);
    return [
        data,
        (update: { [key: string]: any }) => {
            formEngine.updateNodeData(nodeId, update);
        },
    ];
}
