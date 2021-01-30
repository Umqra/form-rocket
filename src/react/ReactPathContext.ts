import * as React from "react";

import {Path} from "../core/Tree";

export interface FormPath {
    data: Path;
    view: Path;
}

export const ReactPathContext: React.Context<FormPath> = React.createContext({data: [], view: []});
