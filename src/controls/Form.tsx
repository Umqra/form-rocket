import * as React from "react";
import {ColumnStack} from "@skbkontur/react-stack-layout";

export function Form({children}: React.PropsWithChildren<{}>) {
    return <ColumnStack gap={3}>{children}</ColumnStack>;
}
