import * as React from "react";

import { createTree, Tree } from "../core/Tree";

export interface FormTree {
    data: Tree;
    view: Tree;
}

export const ReactFormContext: React.Context<FormTree> = React.createContext({
    data: createTree(),
    view: createTree()
});
