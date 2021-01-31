import * as React from "react";
import {ColumnStack, Fit, Fixed} from "@skbkontur/react-stack-layout";

export function Section({caption, children}: React.PropsWithChildren<{caption: string}>) {
    return (
        <ColumnStack gap={3}>
            <Fixed width={300}><b>{caption}</b></Fixed>
            <Fit/>
            <Fit>
                <ColumnStack gap={3}>
                    {children}
                </ColumnStack>
            </Fit>
        </ColumnStack>
    );
}
