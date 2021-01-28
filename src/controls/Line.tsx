import * as React from "react";

export function Line({caption, children}: React.PropsWithChildren<{caption: string}>) {
    return <div>{caption}: {children}</div>
}
