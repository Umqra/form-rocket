import * as React from "react";
import {useFormData} from "../react/ReactFormHook";
import {Path} from "../core/Tree";
import {ReactPathContext} from "../react/ReactPathContext";

export function PathIndex({position, viewPath}: {position: number, viewPath?: Path;}) {
    const globalFormPath = React.useContext(ReactPathContext);
    const currentViewPath = viewPath != null ? [...globalFormPath.view, ...viewPath] : undefined;
    const [, view] = useFormData({view: viewPath});
    if (view.visibility === "hidden") {
        return null;
    }
    return <span>{parseInt(currentViewPath[position]) + 1}</span>;
}
