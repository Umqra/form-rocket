import * as _ from "lodash";
import {createEffect, createEvent, createStore, Store} from "effector";
import {ValidationInfo} from "@skbkontur/react-ui-validations"; // todo (sivukhin, 23.01.2021): Optimize huge lodash import

export type FormTemplateId = {
    viewId: string;
    dataId?: string;
};

export type FormTemplate = FormTemplateId & {children: FormTemplate[]; props: any;};

export type Accessibility = "hidden" | "readonly" | "editable";

export interface Form {
    data: any;
    view: any;
    traverse<T>(tree: any, combine: (node: any, stores: Store<T>[]) => Store<T>): Store<T>;
    findRelated(node: any): any[];
    findMatchedParents(node: any, data: any): any;
    extract(filter: (props: any) => boolean): Form;
}

interface TreeDescriptor {
    id: string;
    children: TreeDescriptor[];
    payload?: any;
}

// note (sivukhin, 23.04.2021): Дань jQuery
// note (sivukhin, 23.04.2021): Мне платят деньги за количество знаков долларов в коде
export const $ = Symbol("meta");

function createTree(descriptor: TreeDescriptor, root: any, factory: (id: string, payload: any) => any) {
    for (const child of descriptor.children) {
        if (_.get(root, child.id) == null) {
            _.set(root, child.id, {[$]: {...factory(child.id, child.payload)}})
        }
        createTree(child, root, factory);
    }
    return root;
}

function createViewDescriptor(template: FormTemplate): TreeDescriptor {
    return {
        id: template.viewId,
        children: template.children.map(c => createViewDescriptor(c)),
        payload: template.props,
    }
}

function createDataDescriptors(template: FormTemplate): TreeDescriptor[] {
    if (template.dataId != null) {
        return [{
            id: template.dataId,
            children: template.children.map(c => createDataDescriptors(c)).flat(),
        }]
    }
    return template.children.map(c => createDataDescriptors(c)).flat();
}

function createDataDescriptor(template: FormTemplate): TreeDescriptor {
    const descriptors = createDataDescriptors(template);
    return {
        id: "",
        children: descriptors,
    };
}

function createForm(template: FormTemplate, data: any, view: any): Form {
    const related = new Map<any, any[]>();
    const paths = new Map<any, string[]>();
    function addLink(a: any, b: any) {
        if (!related.has(a)) {
            related.set(a, []);
        }
        related.get(a).push(b);
    }
    function addPath(a: any, path: string) {
        if (!paths.has(a)) {
            paths.set(a, []);
        }
        paths.get(a).push(path);
    }
    function createLinks(template: FormTemplate) {
        const viewNode = _.get(view, template.viewId);
        addPath(viewNode, template.viewId);
        if (template.dataId != null) {
            const dataNode = _.get(data, template.dataId);
            addLink(dataNode, viewNode);
            addLink(viewNode, dataNode);
            addPath(dataNode, template.dataId);
        }
        for (const child of template.children) {
            createLinks(child);
        }
    }
    function extractTemplates(template: FormTemplate, filter: (props: any) => boolean, isRoot: boolean): FormTemplate[] {
        const templates: FormTemplate[] = [];
        for (const child of template.children) {
            const childTemplates = extractTemplates(child, filter, false);
            templates.push(...childTemplates);
        }
        if (filter(template.props) || isRoot) {
            return [{
                ...template,
                children: templates
            }];
        }
        return templates;
    }
    function extractTemplate(template: FormTemplate, filter: (props: any) => boolean): FormTemplate {
        const [root] = extractTemplates(template, filter, true);
        return root;
    }
    function traverseInternal<T>(tree: any, combine: (node: any, stores: Store<T>[]) => Store<T>): Store<T>[] {
        const stores: Store<T>[] = [];
        for (const prop of Object.keys(tree)) {
            if (tree.hasOwnProperty(prop)) {
                stores.push(...traverseInternal(tree[prop], combine));
            }
        }
        if (!tree.hasOwnProperty($)) {
            return stores;
        }
        return [combine(tree, stores)];
    }
    createLinks(template);
    return {
        data,
        view,
        traverse<T>(tree: any, combine: (node: any, stores: Store<T>[]) => Store<T>): Store<T> {
            const [root] = traverseInternal<T>(tree, combine);
            return root;
        },
        findRelated(node: any): any[] {
            if (related.has(node)) {
                return related.get(node);
            }
            return [];
        },
        findMatchedParents(node: any, data: any): any[] {
            const parents: any[] = [];
            for (const path of paths.has(node) ? paths.get(node) : []) {
                const segments = path.split(".");
                for (let prefix = segments.length - 1; prefix > 0; prefix--) {
                    const parentPath = segments.slice(0, prefix).join(".");
                    const parentNode = _.get(data, parentPath);
                    if (parentNode != null && parentNode.hasOwnProperty($)) {
                        parents.push(parentNode);
                        break;
                    }
                }
            }
            return parents;
        },
        extract(filter: (props: any) => boolean): Form {
            const extractedTemplate = extractTemplate(template, filter);
            const extractedData = createTree(createDataDescriptor(extractedTemplate), {}, (path) => {
                const node = _.get(data, path);
                return {...node[$]};
            });
            const extractedView = createTree(createViewDescriptor(extractedTemplate), {}, (path) => {
                const node = _.get(view, path);
                return {...node[$]};
            });
            return createForm(extractedTemplate, extractedData, extractedView);
        },
    };
}

export function processTemplate(template: FormTemplate) : Form {
    const view = createTree(createViewDescriptor(template), {}, (path: string, props: any) => {
        const $accessibility = createStore<Accessibility>("editable");
        const accessibilityChanged = createEvent<Accessibility>("accessibilityChanged");
        const activateFx = createEffect<() => Promise<void>>(async () => {});
        $accessibility.on(accessibilityChanged, (_, x) => x);
        return {
            $accessibility,
            accessibilityChanged,
            activateFx,
            props
        };
    });
    const data = createTree(createDataDescriptor(template), {}, () => {
        const $value = createStore<any>(null);
        const valueChanged = createEvent<any>("valueChanged");
        $value.on(valueChanged, (_, x) => {
            return x;
        });

        const $validation = createStore<ValidationInfo | null>(null);
        return {
            $value,
            valueChanged,
            $validation,
        };
    });
    return createForm(template, data, view);
}
