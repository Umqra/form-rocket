import * as React from "react";

type Removable<TValue> = TValue & {isRemoved?: boolean}

interface ArrayProps<TValue> {
    childrenKeys: string[];
}

export function Array<TValue>({value, children}: React.PropsWithChildren<{value: Removable<TValue>[]}>) {

}
