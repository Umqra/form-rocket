import * as _ from "lodash"; // todo (sivukhin, 23.01.2021): Optimize huge lodash import

import {Tree, Path} from "./core/Tree";
import {FormTemplate} from "./FormTemplate";

interface FormSubscription {
    update(dataPath: Path, value: any): void;
}

export interface Form {
    update(nodePath: Path, data: any): void;
    subscribe(subscription: FormSubscription): () => void;
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

export function createForm(dataTree: Tree, form: FormTemplate): Form {
    let subscriptionId = 0;
    const subscriptions: Array<[number, FormSubscription]> = [];

    let internalSubscriptions: Array<[Path, () => void]> = [];
    populateTree(dataTree, [], [], form, {});
    
    return {
        update: (nodePath, data) => {
            unsubscribeSubTree(dataTree, nodePath);
            const [dataPath, subForm] = populatePath(dataTree, [], nodePath, [], form, data);
            populateTree(dataTree, nodePath, dataPath, subForm, data);
        },
        subscribe: (subscription) => {
            const currentId = subscriptionId++;
            subscriptions.push([currentId, subscription]);
            return () => {
                const index = subscriptions.findIndex(x => x[0] === currentId);
                subscriptions.splice(index, 1);
            }
        }
    };

    function unsubscribeSubTree(dataTree: Tree, nodePath: Path) {
        for (const [, unsubscribe] of internalSubscriptions.filter(x => isPrefixOf(nodePath, x[0]))) {
            unsubscribe();
        }
        internalSubscriptions = internalSubscriptions.filter(x => !isPrefixOf(nodePath, x[0]));
    }

    function createNode(dataTree: Tree, nodePath: Path, dataPath: Path, form: FormTemplate, data: any): [Path, {[key: string]: any}] {
        const nodeTags = form.tags || {};
        let nodeData: {value: any} = {value: undefined};
        // todo (sivukhin, 23.01.2021): path or dataPath?
        const currentDataPath = nodeTags.path;
        if (currentDataPath != null) {
            nodeData = {value: _.get(data, [...dataPath, ...currentDataPath])};
        }
        if (form.kind === "static" && currentDataPath != null) {
            dataTree.updateNode(nodePath, {tags: nodeTags, data: nodeData});
            const unsubscribe = dataTree.subscribe(nodePath, {
                update: (node) => {
                    for (const [, subscription] of subscriptions) {
                        subscription.update([...dataPath, ...currentDataPath], node.data.value);
                    }
                },
                dependencies: [{kind: "data", value: "value"}]
            });
            internalSubscriptions.push([nodePath, unsubscribe]);
        } else if (form.kind === "array" && currentDataPath != null) {
            const keys = nodeData.value == null ? [] : Object.keys(nodeData.value);
            dataTree.updateNode(nodePath, {tags: nodeTags, data: {value: keys}});
        }
        return [currentDataPath == null ? null : [...dataPath, ...currentDataPath], nodeData];
    }

    function populatePath(dataTree: Tree, currentNodePath: Path, targetNodePath: Path, dataPath: Path, form: FormTemplate, data: any): [Path, FormTemplate] {
        if (currentNodePath.length >= targetNodePath.length) {
            return [dataPath, form];
        }
        if (dataTree.tryGetNode(currentNodePath) == null) {
            createNode(dataTree, currentNodePath, dataPath, form, data);
        }
        let subForm: FormTemplate | null = null;
        let currentDataPath: Path = dataPath;
        if (form.kind === "static") {
            const key = targetNodePath[currentNodePath.length];
            subForm = form.children.find(x => x.key === key);
            return populatePath(dataTree, [...currentNodePath, key], targetNodePath, currentDataPath, subForm, data);
        } else if (form.kind === "array") {
            if (currentNodePath.length + 1 >= targetNodePath.length) {
                throw new Error("path must contain both array children index and template key");
            }
            const index = targetNodePath[currentNodePath.length]
            const key = targetNodePath[currentNodePath.length + 1];
            subForm = form.templates.find(x => x.key === key);
            const node = dataTree.tryGetNode(currentNodePath);
            if (node == null || node.tags.path == null) {
                throw new Error("no node for array templates node");
            }
            currentDataPath = [...currentDataPath, ...(node.tags.path as Path), key];
            return populatePath(dataTree, [...currentNodePath, index, key], targetNodePath, currentDataPath, subForm, data);
        }
    }

    function populateTree(dataTree: Tree, nodePath: Path, dataPath: Path, form: FormTemplate, data: any) {
        const [currentDataPath, nodeData] = createNode(dataTree, nodePath, dataPath, form, data);
        switch (form.kind) {
            case "static":
                for (const child of form.children) {
                    populateTree(dataTree, [...nodePath, child.key], dataPath, child, data);
                }
                return;
            case "array":
                if (currentDataPath == null) {
                    throw new Error("'array' form node must have the 'path' tags");
                }
                if (nodeData.value != null && !Array.isArray(nodeData.value)) {
                    throw new Error("'array' form node must bind to the Array object");
                }
                const itemIds = new Set();
                const length = nodeData.value == null ? 0 : nodeData.value.length;
                for (let i = 0; i < length; i++) {
                    itemIds.add(i.toString());
                    for (const template of form.templates) {
                        const itemNodePath = [...nodePath, i.toString(), template.key];
                        const itemDataPath = [...currentDataPath, i.toString()];
                        populateTree(dataTree, itemNodePath, itemDataPath, template, data);
                    }
                }
                for (const child of dataTree.children(nodePath)) {
                    if (!itemIds.has(child[child.length - 1])) {
                        dataTree.removeNode(child);
                    }
                }
                return;
        }
    }
}
