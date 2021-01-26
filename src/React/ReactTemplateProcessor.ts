import * as React from "react";
import {nanoid} from "nanoid";
import {FormTemplate, FormTemplateKind} from "../FormTemplate";
import {Path} from "../FormDataTree";
import {Connect} from "./ReactConnect";

type ReactTemplateTagConfiguration = {
    kind: "fromProp",
    propName: string;
} | {
    kind: "fromValue";
    value: string;
}

export interface ReactTemplateConfiguration {
    kind: FormTemplateKind;
    tags?: {
        [key: string]: ReactTemplateTagConfiguration
    }
}

function createTags(element: React.ReactElement, config: ReactTemplateConfiguration): {[key: string]: any} {
    const tags: {[key: string]: any} = {};
    if (config.tags == null) {
        return tags;
    }
    for (const [tag, tagConfig] of Object.entries(config.tags)) {
        if (tagConfig.kind === "fromValue") {
            tags[tag] = tagConfig.value;
        } else if (tagConfig.kind === "fromProp") {
            tags[tag] = element.props[tagConfig.propName];
        }
    }
    return tags;
}

export function configureComponent<TProps>(elementType: React.ComponentType<TProps>, config: ReactTemplateConfiguration): React.ComponentType<TProps> {
    // @ts-ignore
    elementType.formConfiguration = config;
    return elementType;
}

export function processReactTemplate(element: React.ReactNode): {
    templateRoot: FormTemplate;
    reactRoot: React.ReactNode;
} {
    const result = processReactTemplateInternal(element, []);
    return {
        templateRoot: {
            kind: "static",
            key: "",
            children: result.templateRoots
        },
        reactRoot: result.reactRoot
    }
}

function processReactTemplateInternal(element: React.ReactNode, nodePath: Path): {
    templateRoots: FormTemplate[];
    reactRoot: React.ReactNode;
} {
    if (React.isValidElement(element)) {
        const elementType: any = element.type;
        const configuration: ReactTemplateConfiguration | undefined = elementType.formConfiguration;
        const {children, ...props} = element.props || {};
        if (configuration != null && configuration.kind === "static") {
            // todo (sivukhin, 24.01.2021): Fix this?
            const nodeKey = nanoid(6);
            const currentNodePath = [...nodePath, nodeKey];
            const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, currentNodePath));
            return {
                templateRoots: [
                    {
                        kind: "static",
                        key: nodeKey,
                        tags: createTags(element, configuration),
                        children: processed.map(x => x.templateRoots).flat()
                    }
                ],
                reactRoot: React.createElement(Connect, {
                    nodePath: currentNodePath,
                    kind: "static",
                    template: element,
                    key: nodeKey,
                }, processed.map(x => x.reactRoot))
            }
        } else if (configuration != null && configuration.kind === "array") {
            const nodeKey = nanoid(6);
            const currentNodePath = [...nodePath, nodeKey];
            const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, []));
            return {
                templateRoots: [
                    {
                        kind: "array",
                        key: nodeKey,
                        tags: createTags(element, configuration),
                        templates: processed.map(x => x.templateRoots).flat()
                    }
                ],
                reactRoot: React.createElement(Connect, {
                    nodePath: currentNodePath,
                    kind: "array",
                    template: element,
                    key: nodeKey,
                }, React.createElement(React.Fragment, null, processed.map(x => x.reactRoot)))
            };
        }
        const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, nodePath));
        return {
            templateRoots: processed.map(x => x.templateRoots).flat(),
            reactRoot: React.cloneElement(element, {}, processed.map(x => x.reactRoot))
        }
    } else if (element == null || typeof element == "string" || typeof element == "number" || typeof element == "boolean") {
        return {
            templateRoots: [],
            reactRoot: element
        };
    }
    throw new Error(`unexpected ReactNode: ${element}`)
}
