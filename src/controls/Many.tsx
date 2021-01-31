import * as React from "react";

export function Many<TValue>({children}: React.PropsWithChildren<{}>) {
    return <>{React.Children.map(children, (x, i) => x
    )}</>;
}
