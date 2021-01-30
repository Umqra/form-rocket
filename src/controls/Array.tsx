import * as React from "react";

export function Array<TValue>({children}: React.PropsWithChildren<{}>) {
    return <>{React.Children.map(children, (x, i) => (
        <div>{i + 1}. {x}</div>
    ))}</>;
}
