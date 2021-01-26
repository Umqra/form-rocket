import * as React from "react";

import { createDataTree, FormDataTree } from "../FormDataTree";

export const ReactFormContext: React.Context<FormDataTree> = React.createContext(createDataTree());
