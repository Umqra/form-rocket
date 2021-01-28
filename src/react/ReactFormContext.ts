import * as React from "react";

import { createTree, Tree } from "../core/Tree";

export const ReactFormContext: React.Context<Tree> = React.createContext(createTree());
