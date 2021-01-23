import * as React from "react";

import { createEngine, FormDataTree } from "../FormDataTree";

export const FormEngineContext: React.Context<FormDataTree> = React.createContext(createEngine());
