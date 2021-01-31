import * as React from "react";
import {configureComponent, processReactTemplate} from "./ReactTemplateProcessor";

const PropComponent = configureComponent(function(props: React.PropsWithChildren<{color: string}>) {
    return <div>{props.children}</div>
}, {kind: "view", tags: {color: {kind: "fromProp", propName: "color"}}});

const ValueComponent = configureComponent(function(props: React.PropsWithChildren<any>) {
    return <div>{props.children}</div>
}, {kind: "data-leaf", tags: {type: {kind: "fromValue", value: "huge"}, caption: {kind: "fromProp", propName: "caption"}}});

const ArrayComponent = configureComponent(function(props: React.PropsWithChildren<any>){
    return <div>{props.children}</div>;
}, {kind: "data-array", tags: {caption: {kind: "fromProp", propName: "caption"}}});

test("simple templates", () => {
    const {templateRoot: template} = processReactTemplate(<div>
        <PropComponent color="yellow">
            <div>
                <ValueComponent path={["root", "component"]}/>
                <div>
                    <ArrayComponent path={["items"]} caption="items">
                        <ValueComponent path={["value"]} caption="item"/>
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
                color: ["yellow"]
            },
            children: [
                {
                    kind: "data-leaf",
                    viewKey: expect.any(String),
                    dataPath: ["root", "component"],
                    tags: {
                        type: ["huge"]
                    }
                },
                {
                    kind: "data-array",
                    viewKey: expect.any(String),
                    dataPath: ["items"],
                    tags: {
                        caption: ["items"]
                    },
                    templates: [
                        {
                            kind: "data-leaf",
                            viewKey: expect.any(String),
                            dataPath: ["value"],
                            tags: {
                                type: ["huge"],
                                caption: ["items", "item"]
                            },
                        }
                    ]
                },
            ]
        }]
    })
});