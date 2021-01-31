import * as _ from "lodash"; // todo (sivukhin, 23.01.2021): Optimize huge lodash import

import {Tree, Path} from "./core/Tree";
import {FormTemplate} from "./FormTemplate";
import {LinkedTrees} from "./core/LinkedTrees";

interface FormSubscription {
    notify(data: any, changes: Path[]): void;
}

interface FormSubscriptionResult {
    update(dataPath: Path, update: any): void;
    unsubscribe(): void;
}

export interface Form {
    attach(subscription?: FormSubscription): FormSubscriptionResult;
}

function isPrefixOf<T>(prefix: T[], array: T[]) {
    if (prefix.length > array.length) {
        return false;
    }
    for (let i = 0; i < prefix.length; i++) {
        if (prefix[i] !== array[i]) {
            return false;
        }
    }
    return true;
}

type Trees = LinkedTrees<{ data: Tree, view: Tree }>;

export function createForm(trees: Trees, form: FormTemplate): Form {
    let container: {data: any} = {data: {}};
    let subscriptionId = 0;
    const subscriptions: Array<[number, FormSubscription]> = [];

    let internalViewNodes: Map<FormTemplate, Path[]> = new Map();
    let internalSubscriptions: Array<[Path, () => void]> = [];
    trees.connect({data: [[]], view: [[]]});
    const readyForm: Form = {
        attach: (subscription) => {
            let currentId: number | undefined = undefined;
            if (subscription != null) {
                currentId = subscriptionId++;
                subscriptions.push([currentId, subscription]);
            }
            return {
                unsubscribe: () => {
                    const index = subscriptions.findIndex(x => x[0] === currentId);
                    subscriptions.splice(index, 1);
                },
                update: (dataPath, update) => {
                    container = _.set(container, ["data", ...dataPath], update);
                    unsubscribeSubTree(trees.data, dataPath);
                    const connections = trees.connections({data: [dataPath]});
                    for (const viewPath of connections.view) {
                        const [subForm, subDataPath] = getSubTree([], viewPath, [], form);
                        freeViewSubTree(trees.view, viewPath, subForm);
                        populateTree(trees, viewPath, subDataPath, subForm, container.data);
                    }
                    for (const [id, subscription] of subscriptions) {
                        if (id === currentId) {
                            continue;
                        }
                        subscription.notify(container.data, [dataPath]);
                    }
                },
            }
        }
    };
    populateTree(trees, [], [], form, container.data);
    return readyForm;

    function unsubscribeSubTree(dataTree: Tree, dataPath: Path) {
        for (const [, unsubscribe] of internalSubscriptions.filter(x => isPrefixOf(dataPath, x[0]))) {
            unsubscribe();
        }
        internalSubscriptions = internalSubscriptions.filter(x => !isPrefixOf(dataPath, x[0]));
    }

    function controlUpdate(form: FormTemplate, data: {[key: string]: any}) {
        if (!internalViewNodes.has(form)) {
            return;
        }
        for (const viewPath of internalViewNodes.get(form)) {
            trees.view.updateNode(viewPath, {data: data});
        }
    }

    function freeViewSubTree(tree: Tree, viewPath: Path, form: FormTemplate) {
        if (form.control != null) {
            internalViewNodes.delete(form);
        }
        switch (form.kind) {
            case "view":
                for (const child of form.children) {
                    freeViewSubTree(tree, [...viewPath, child.viewKey], child);
                }
                return;
            case "data-array":
                for (const childPath of tree.children(viewPath)) {
                    const childIndex = childPath[childPath.length - 1];
                    for (const template of form.templates) {
                        freeViewSubTree(tree, [...viewPath, childIndex, template.viewKey], template);
                    }
                }
                return;
            case "data-leaf":
                return;
        }

    }

    function initializeNode(trees: Trees, viewPath: Path, dataPath: Path, form: FormTemplate, data: any): [Path, any] {
        trees.view.updateNode(viewPath, {tags: form.tags || {}, data: form.control?.data(readyForm) || {}});
        if (form.control != null) {
            form.control.attach(readyForm, update => controlUpdate(form, update));
            if (!internalViewNodes.has(form)) {
                internalViewNodes.set(form, []);
            }
            internalViewNodes.get(form).push(viewPath);
        }
        if (form.kind === "data-leaf") {
            const currentDataPath = [...dataPath, ...form.dataPath];
            return [currentDataPath, _.get(data, currentDataPath)];
        } else if (form.kind === "data-array") {
            const currentDataPath = [...dataPath, ...form.dataPath];
            return [currentDataPath, _.get(data, currentDataPath)];
        }
        return [dataPath, undefined];
    }

    function finalizeNode(trees: Trees, viewPath: Path, dataPath: Path, form: FormTemplate, dataValue: any) {
        if (form.kind === "data-leaf") {
            trees.data.updateNode(dataPath, {data: {value: dataValue}})
            const unsubscribe = trees.data.subscribe(dataPath, {
                notify: (node) => {
                    container = _.set(container, ["data", ...dataPath], node.data.value);
                    for (const [, subscription] of subscriptions) {
                        subscription.notify(container.data, [dataPath]);
                    }
                },
                dependencies: [{kind: "data", value: "value"}]
            })
            internalSubscriptions.push([dataPath, unsubscribe]);
            trees.connect({data: [dataPath], view: [viewPath]});
        } else if (form.kind === "data-array") {
            const nodeData = dataValue == null ? [] : Object.keys(dataValue);
            trees.data.updateNode(dataPath, {data: {value: nodeData}});
            trees.connect({data: [dataPath], view: [viewPath]});
        }
    }

    function getSubTree(currentPath: Path, viewPath: Path, dataPath: Path, form: FormTemplate): [FormTemplate, Path] {
        if (currentPath.length >= viewPath.length) {
            return [form, dataPath];
        }
        if (form.kind === "data-array") {
            if (currentPath.length + 1 >= viewPath.length) {
                throw new Error("viewPath can't end in the middle of the 'data-array' template node");
            }
            const viewIndex = viewPath[currentPath.length];
            const viewTemplate = viewPath[currentPath.length + 1];
            return getSubTree(
                [...currentPath, viewIndex, viewTemplate],
                viewPath,
                [...dataPath, ...form.dataPath, viewIndex],
                form.templates.find(t => t.viewKey === viewTemplate)
            );
        } else if (form.kind === "data-leaf") {
            throw new Error("too long template path");
        } else if (form.kind === "view") {
            const viewTemplate = viewPath[currentPath.length];
            return getSubTree(
                [...currentPath, viewTemplate],
                viewPath,
                dataPath,
                form.children.find(t => t.viewKey === viewTemplate)
            );
        }
    }

    function populateTree(trees: Trees, viewPath: Path, dataPath: Path, form: FormTemplate, data: any) {
        const [currentDataPath, nodeData] = initializeNode(trees, viewPath, dataPath, form, data);
        switch (form.kind) {
            case "view":
                for (const child of form.children) {
                    populateTree(trees, [...viewPath, child.viewKey], dataPath, child, data);
                }
                finalizeNode(trees, viewPath, currentDataPath, form, nodeData);
                return;
            case "custom":
                finalizeNode(trees, viewPath, currentDataPath, form, nodeData);
                return;
            case "data-array":
                if (currentDataPath == null) {
                    throw new Error("'data-array' form node must have the dataPath");
                }
                if (nodeData != null && !Array.isArray(nodeData)) {
                    throw new Error("'data-array' form node must bind to the Many object");
                }
                const itemIds = new Set();
                const length = nodeData == null ? 0 : nodeData.length;
                for (let i = 0; i < length; i++) {
                    itemIds.add(i.toString());
                    for (const template of form.templates) {
                        trees.connect({view: [[...viewPath, i.toString()]], data: [[...currentDataPath, i.toString()]]});
                        const itemViewPath = [...viewPath, i.toString(), template.viewKey];
                        const itemDataPath = [...currentDataPath, i.toString()];
                        populateTree(trees, itemViewPath, itemDataPath, template, data);
                    }
                }
                for (const dataChild of trees.data.children(currentDataPath)) {
                    if (!itemIds.has(dataChild[dataChild.length - 1])) {
                        // todo (sivukhin, 29.01.2021): Remove connections!
                        trees.data.removeNode(dataChild);
                        const connections = trees.connections({data: [dataChild]});
                        for (const viewChild of connections.view) {
                            trees.view.removeNode(viewChild);
                        }
                    }
                }
                finalizeNode(trees, viewPath, currentDataPath, form, nodeData);
                return;
            case "data-leaf":
                finalizeNode(trees, viewPath, currentDataPath, form, nodeData);
                return;
        }
    }
}
