import * as React from "react";
import {configureComponent, processReactTemplate} from "./ReactTemplateProcessor";

const PropComponent = configureComponent(function(props: React.PropsWithChildren<{color: string}>) {
    return <div>{props.children}</div>
}, {kind: "view", tags: {color: {kind: "fromProp", propName: "color"}}});

const ValueComponent = configureComponent(function(props: React.PropsWithChildren<any>) {
    return <div>{props.children}</div>
}, {kind: "data-leaf", tags: {type: {kind: "fromValue", value: "huge"}}});

const ArrayComponent = configureComponent(function(props: React.PropsWithChildren<any>){
    return <div>{props.children}</div>;
}, {kind: "data-array"});

test("simple templates", () => {
    const {templateRoot: template} = processReactTemplate(<div>
        <PropComponent color="yellow">
            <div>
                <ValueComponent path={["root", "component"]}/>
                <div>
                    <ArrayComponent path={["items"]}>
                        <ValueComponent path={["value"]}/>
                    </ArrayComponent>
                </div>
            </div>
            <div/>
        </PropComponent>
    </div>);
    expect(template).toEqual({
        kind: "view",
        viewKey: "",
        children: [{
            kind: "view",
            viewKey: expect.any(String),
            tags: {
                color: "yellow"
            },
            children: [
                {
                    kind: "data-leaf",
                    viewKey: expect.any(String),
                    dataPath: ["root", "component"],
                    tags: {
                        type: "huge"
                    }
                },
                {
                    kind: "data-array",
                    viewKey: expect.any(String),
                    dataPath: ["items"],
                    tags: {},
                    templates: [
                        {
                            kind: "data-leaf",
                            viewKey: expect.any(String),
                            dataPath: ["value"],
                            tags: {
                                type: "huge"
                            },
                        }
                    ]
                },
            ]
        }]
    })
});