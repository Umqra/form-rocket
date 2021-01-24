import * as React from "react";
import {nanoid} from "nanoid";
import {FormTemplate, FormTemplateKind} from "../FormTemplate";

type ReactTemplateTagConfiguration = {
    kind: "fromProp",
    propName: string;
} | {
    kind: "fromValue";
    value: string;
}

interface ReactTemplateConfiguration {
    kind: FormTemplateKind;
    tags?: {
        [key: string]: ReactTemplateTagConfiguration
    }
}

function createTags(element: React.ReactElement, config: ReactTemplateConfiguration): {[key: string]: string} {
    const tags: {[key: string]: string} = {};
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

export function processReactTemplate(element: React.ReactElement): FormTemplate[] {
    const elementType: any = element.type;
    const configuration: ReactTemplateConfiguration | undefined  = elementType.formConfiguration;
    if (configuration != null && configuration.kind === "static") {
        return [
            {
                kind: "static",
                // todo (sivukhin, 24.01.2021): Fix this?
                key: nanoid(16),
                tags: createTags(element, configuration),
                children: (React.Children.toArray(element.props.children) || []).map(processReactTemplate).flat()
            }
        ]
    } else if (configuration != null && configuration.kind === "array") {
        if (React.Children.count(element.props.children) !== 1) {
            throw new Error("'array' template node must have single children");
        }
        const template = processReactTemplate(React.Children.only(element.props.children));
        if (template.length !== 1) {
            throw new Error("'array' template node must have single form children");
        }
        return [
            {
                kind: "array",
                key: nanoid(16),
                tags: createTags(element, configuration),
                template: template[0]
            }
        ];
    }
    return (React.Children.toArray(element.props.children) || []).map(processReactTemplate).flat();
}
