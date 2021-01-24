import {createDataTree, FormDataTree, Path} from "./FormDataTree";
import * as _ from "lodash"; // todo (sivukhin, 23.01.2021): Optimize huge lodash import

export type FormTemplate = {
    kind: "static",
    key: string;
    tags?: {
        [key: string]: string;
    };
    children: FormTemplate[]
} | {
    kind: "array",
    key: string,
    tags?: {
        [key: string]: string;
    };
    template: FormTemplate
}

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

export function createForm(dataTree: FormDataTree, form: FormTemplate): Form {
    let subscriptionId = 0;
    const subscriptions: Array<[number, FormSubscription]> = [];

    let internalSubscriptions: Array<[Path, () => void]> = [];
    populateTree(dataTree, [form.key], [], form, {}); 
    
    return {
        update: (nodePath, data) => {
            unsubscribeSubTree(dataTree, nodePath);
            const [dataPath, subForm] = populatePath(dataTree, [form.key], nodePath, [], form, data);
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

    function unsubscribeSubTree(dataTree: FormDataTree, nodePath: Path) {
        for (const [path, unsubscribe] of internalSubscriptions.filter(x => isPrefixOf(nodePath, x[0]))) {
            unsubscribe();
        }
        internalSubscriptions = internalSubscriptions.filter(x => !isPrefixOf(nodePath, x[0]));
    }

    function createNode(dataTree: FormDataTree, nodePath: Path, dataPath: Path, form: FormTemplate, data: any) {
        const nodeTags = form.tags || {};
        let nodeData = {};
        // todo (sivukhin, 23.01.2021): path or dataPath?
        const currentDataPath = nodeTags.path;
        if (currentDataPath != null) {
            nodeData = {value: _.get(data, [...dataPath, ...currentDataPath])};
        }
        if (form.kind === "static" && currentDataPath != null) {
            dataTree.updateNode(nodePath, {tags: nodeTags, data: nodeData});
            const unsubscribe = dataTree.subscribe(nodePath, {
                update: (node) => {
                    for (const [_, subscription] of subscriptions) {
                        subscription.update([...dataPath, ...currentDataPath], node.data.value);
                    }
                },
                dependencies: [{kind: "data", value: "value"}]
            });
            internalSubscriptions.push([nodePath, unsubscribe]);
        } else {
            dataTree.updateNode(nodePath, {tags: nodeTags});
        }
        return [currentDataPath == null ? null : [...dataPath, ...currentDataPath], nodeData];
    }

    function populatePath(dataTree: FormDataTree, currentNodePath: Path, targetNodePath: Path, dataPath: Path, form: FormTemplate, data: any) {
        if (currentNodePath.length >= targetNodePath.length) {
            return [dataPath, form];
        }
        if (dataTree.tryGetNode(currentNodePath) == null) {
            createNode(dataTree, currentNodePath, dataPath, form, data);
        }
        const key = targetNodePath[currentNodePath.length];
        let subForm: FormTemplate | null = null;
        const currentDataPath = dataPath;
        if (form.kind === "static") {
            subForm = form.children.find(x => x.key === key);
        } else if (form.kind === "array") {
            subForm = form.template;
            const node = dataTree.tryGetNode(currentNodePath);
            if (node == null || node.tags.path == null) {
                throw new Error("no node for array template node");
            }
            currentDataPath = [...currentDataPath, node.tags.path as Path];
        } else {
            throw new Error(`unexpected kind of form template: ${form.kind}`);
        }
        return populatePath(dataTree, [...currentNodePath, targetNodePath[currentDataPath.length]], targetNodePath, currentDataPath, subForm);
    }

    function populateTree(dataTree: FormDataTree, nodePath: Path, dataPath: Path, form: FormTemplate, data: any) {
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
                    const itemNodePath = [...nodePath, i.toString(), form.template.key];
                    const itemDataPath = [...currentDataPath, i.toString()];
                    populateTree(dataTree, itemNodePath, itemDataPath, form.template, data);
                }
                for (const child of dataTree.children(nodePath)) {
                    if (!itemIds.has(child[child.length - 1])) {
                        dataTree.removeNode(child);
                    }
                }
                return;
            default:
                throw new Error(`unexpected kind of template node: ${template.kind}`);
        }
    }
}
