import * as React from "react";
import {configureComponent, processReactTemplate} from "./ReactTemplateProcessor";

const PropComponent = configureComponent(function(props: React.PropsWithChildren<{path: string[]}>) {
    return <div>{props.children}</div>
}, {kind: "static", tags: {"path": {kind: "fromProp", propName: "path"}}});

const ValueComponent = configureComponent(function(props: React.PropsWithChildren<any>) {
    return <div>{props.children}</div>
}, {kind: "static", tags: {"type": {kind: "fromValue", value: "huge"}}});

const ArrayComponent = configureComponent(function(props: React.PropsWithChildren<any>){
    return <div>{props.children}</div>;
}, {kind: "array"});

test("simple templates", () => {
    const {templateRoot: template} = processReactTemplate(<div>
        <PropComponent path={["root", "component"]}>
            <div>
                <ValueComponent/>
                <div>
                    <ArrayComponent>
                        <ValueComponent/>
                    </ArrayComponent>
                </div>
            </div>
            <div/>
        </PropComponent>
    </div>);
    expect(template).toEqual({
        kind: "static",
        key: "",
        children: [{
            kind: "static",
            key: expect.any(String),
            tags: {
                path: ["root", "component"]
            },
            children: [
                {
                    kind: "static",
                    key: expect.any(String),
                    tags: {
                        type: "huge"
                    },
                    children: []
                },
                {
                    kind: "array",
                    key: expect.any(String),
                    tags: {},
                    template: {
                        kind: "static",
                        key: expect.any(String),
                        tags: {
                            type: "huge"
                        },
                        children: []
                    }
                },
            ]
        }]
    })
});