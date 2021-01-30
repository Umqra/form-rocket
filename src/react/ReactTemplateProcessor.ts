import * as React from "react";
import {nanoid} from "nanoid";
import {FormTemplate, FormTemplateKind} from "../FormTemplate";
import {Path} from "../core/Tree";
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

function joinTags(tagKey: string, tagValue: string, previousTags: Tags): string[] {
    if (previousTags.hasOwnProperty(tagKey)) {
        return [...previousTags[tagKey], tagValue];
    }
    return [tagValue];
}

function createTags(element: React.ReactElement, config: ReactTemplateConfiguration, previousTags: Tags): Tags {
    const tags: {[key: string]: any} = {};
    if (config.tags == null) {
        return tags;
    }
    for (const [tagKey, tagConfig] of Object.entries(config.tags)) {
        if (tagConfig.kind === "fromValue") {
            tags[tagKey] = joinTags(tagKey, tagConfig.value, previousTags);
        } else if (tagConfig.kind === "fromProp") {
            const value = element.props[tagConfig.propName];
            if (typeof value === "string") {
                tags[tagKey] = joinTags(tagKey, value, previousTags);
            } else {
                // todo (sivukhin, 30.01.2021): Write warning?
            }
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
    const result = processReactTemplateInternal(element, [], {});
    return {
        templateRoot: {
            kind: "view",
            viewKey: "",
            children: result.templateRoots
        },
        reactRoot: result.reactRoot
    }
}

type Tags = {[key: string]: string[]};

function processReactTemplateInternal(element: React.ReactNode, viewPath: Path, tags: Tags): {
    templateRoots: FormTemplate[];
    reactRoot: React.ReactNode;
} {
    if (React.isValidElement(element)) {
        const elementType: any = element.type;
        const configuration: ReactTemplateConfiguration | undefined = elementType.formConfiguration;
        const {children, ...props} = element.props || {};
        if (configuration != null) {
            const currentTags = createTags(element, configuration, tags);
            const updatedTags = {...tags, ...currentTags};
            if (configuration.kind === "view") {
                // todo (sivukhin, 24.01.2021): why we need nanoid?
                const viewKey = nanoid(6);
                const currentViewPath = [...viewPath, viewKey];
                const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, currentViewPath, updatedTags));
                return {
                    templateRoots: [
                        {
                            kind: "view",
                            viewKey: viewKey,
                            tags: currentTags,
                            children: processed.map(x => x.templateRoots).flat()
                        }
                    ],
                    reactRoot: React.createElement(Connect, {
                        viewPath: currentViewPath,
                        kind: "view",
                        template: element,
                        key: viewKey,
                    }, processed.map(x => x.reactRoot))
                }
            } else if (configuration.kind === "data-array") {
                const nodeKey = nanoid(6);
                const currentViewPath = [...viewPath, nodeKey];
                const dataPath = element.props.path;
                const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, [], updatedTags));
                return {
                    templateRoots: [
                        {
                            kind: "data-array",
                            viewKey: nodeKey,
                            dataPath: dataPath,
                            tags: currentTags,
                            templates: processed.map(x => x.templateRoots).flat()
                        }
                    ],
                    reactRoot: React.createElement(Connect, {
                        kind: "data-array",
                        viewPath: currentViewPath,
                        dataPath: dataPath,
                        template: element,
                        key: nodeKey,
                    }, React.createElement(React.Fragment, null, processed.map(x => x.reactRoot)))
                };
            } else if (configuration.kind === "data-leaf") {
                const nodeKey = nanoid(6);
                const currentViewPath = [...viewPath, nodeKey];
                const dataPath = element.props.path;
                return {
                    templateRoots: [
                        {
                            kind: "data-leaf",
                            viewKey: nodeKey,
                            dataPath: dataPath,
                            tags: currentTags,
                        }
                    ],
                    reactRoot: React.createElement(Connect, {
                        kind: "data-leaf",
                        viewPath: currentViewPath,
                        dataPath: dataPath,
                        template: element,
                        key: nodeKey,
                    }, React.createElement(React.Fragment, null, children))
                };
            }
        }
        const processed = (React.Children.toArray(children) || []).map(child => processReactTemplateInternal(child, viewPath, tags));
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
