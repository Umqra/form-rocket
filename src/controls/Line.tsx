import * as React from "react";
import {Fit, Fixed, RowStack} from "@skbkontur/react-stack-layout";

export function Line({caption, children}: React.PropsWithChildren<{caption: string}>) {
    return (
        <RowStack>
            <Fixed width={300}>{caption}</Fixed>
            <Fit>{children}</Fit>
        </RowStack>
    );
}
