import {intersect} from "./SetUtils";
import {pathFromString, pathToString} from "./PathUtils";

export type Path = string[];

type Tags = {[key: string]: string[]};
type Data = {[key: string]: any};

export interface TreeNode {
    tags: Tags;
    data: Data;
}

type SubscriptionDependency = {kind: "data", value: string} | {kind: "tag", value: string} | {kind: "structure", value: "children"}

interface TreeSubscription {
    notify: (data: TreeNode) => void;
    dependencies: SubscriptionDependency[];
}

export interface Tree {
    updateNode(nodePath: Path, node?: Partial<TreeNode>): void;
    removeNode(nodePath: Path): void;
    tryGetNode(nodePath: Path): TreeNode | null;
    subscribe(nodePath: Path, subscription: TreeSubscription): () => void;
    children(nodePath: Path): Path[];
    search(tags: Tags): Path[];
    tags(tagKey: string): string[][];
}

interface InternalTreeNode {
    children: {
        [key: string]: InternalTreeNode
    };
    node: TreeNode;
    subscriptions: Array<[number, TreeSubscription]>;
}

function createEmptyNode(): InternalTreeNode {
    return {
        children: {},
        node: { data: {}, tags: {} },
        subscriptions: [],
    };
}

function addNode(root: InternalTreeNode, nodePath: Path, l: number, r: number): InternalTreeNode {
    if (l >= r) {
        return root;
    }
    const id = nodePath[l];
    if (!root.children.hasOwnProperty(id)) {
        root.children[id] = createEmptyNode();
    }
    return addNode(root.children[id], nodePath, l + 1, r);
}

function tryGetNode(root: InternalTreeNode, nodePath: Path, l: number, r: number): InternalTreeNode | null {
    if (l >= r) {
        return root;
    }
    const id = nodePath[l];
    if (!root.children.hasOwnProperty(id)) {
        return null;
    }
    return tryGetNode(root.children[id], nodePath, l + 1, r);
}

function removeNode(root: InternalTreeNode, nodePath: Path, l: number, r: number) {
    if (l >= r) {
        return;
    }
    const id = nodePath[l];
    if (l + 1 === r) {
        delete root.children[id];
        return;
    }
    removeNode(root.children[id], nodePath, l + 1, r);
}

function matches(dependency: SubscriptionDependency, change: SubscriptionDependency) {
    if (dependency.kind !== change.kind) {
        return false;
    }
    return dependency.value === change.value;
}

function triggerSubscriptions(node: InternalTreeNode, changes: SubscriptionDependency[]) {
    // todo (sivukhin, 19.01.2021): Optimize subscription evaluation with some sort of index?
    for (const [, subscription] of node.subscriptions) {
        let shouldBeTriggered = false;
        for (const dependency of subscription.dependencies) {
            if (shouldBeTriggered) {
                break;
            }
            for (const change of changes) {
                if (matches(dependency, change)) {
                    shouldBeTriggered = true;
                    break;
                }
            }
        }
        if (shouldBeTriggered) {
            subscription.notify(node.node);
        }
    }
}

export function createTree(): Tree {
    const root = createEmptyNode();
    const tagsIndex = new Map<string, Map<string, Set<string>>>();
    let subscriptionId = 0;

    function removeNodeFromTags(path: Path, tags: Tags) {
        const pathString = pathToString(path);
        for (const [tagKey, tagValue] of Object.entries(tags)) {
            if (tagsIndex.has(tagKey)) {
                const joinedTagValue = tagValue.join(".");
                const tagsWithKey = tagsIndex.get(tagKey);
                if (tagsWithKey.has(joinedTagValue)) {
                    tagsWithKey.get(joinedTagValue).delete(pathString);
                }
            }
        }
    }

    function addNodeToTags(path: Path, tags: Tags) {
        const pathString = pathToString(path);
        for (const [tagKey, tagValue] of Object.entries(tags)) {
            if (!tagsIndex.has(tagKey)) {
                tagsIndex.set(tagKey, new Map<string, Set<string>>());
            }
            const tagsWithKey = tagsIndex.get(tagKey);
            const joinedTagValue = tagValue.join(".");
            if (!tagsWithKey.has(joinedTagValue)) {
                tagsWithKey.set(joinedTagValue, new Set<string>());
            }
            tagsWithKey.get(joinedTagValue).add(pathString);
        }
    }

    function getNodesWithTag(tagKey: string, tagValue: string[]): Set<string> {
        if (!tagsIndex.has(tagKey)) {
            return new Set<string>();
        }
        const tagsWithKey = tagsIndex.get(tagKey);
        const joinedTagValue = tagValue.join(".");
        if (!tagsWithKey.has(joinedTagValue)) {
            return new Set<string>();
        }
        return tagsWithKey.get(joinedTagValue);
    }

    return {
        updateNode(nodePath: Path, node?: Partial<TreeNode>) {
            const previousNode = tryGetNode(root, nodePath, 0, nodePath.length);
            const currentNode = addNode(root, nodePath, 0, nodePath.length);
            if (previousNode != null) {
                removeNodeFromTags(nodePath, previousNode.node.tags);
            }

            const dependencies: SubscriptionDependency[] = [];
            if (node != null && node.data != null) {
                currentNode.node.data = {...currentNode.node.data, ...node.data};
                dependencies.push(...Object.keys(node.data).map(x => ({kind: "data", value: x} as SubscriptionDependency)))
            }
            if (node != null && node.tags != null) {
                currentNode.node.tags = {...currentNode.node.tags, ...node.tags};
                dependencies.push(...Object.keys(node.tags).map(x => ({kind: "tag", value: x} as SubscriptionDependency)))
            }

            addNodeToTags(nodePath, currentNode.node.tags);

            if (dependencies.length > 0) {
                triggerSubscriptions(currentNode, dependencies);
            }

            if (previousNode == null) {
                const parent = tryGetNode(root, nodePath, 0, nodePath.length - 1);
                if (parent != null) {
                    triggerSubscriptions(parent, [{kind: "structure", value: "children"}]);
                }
            }
        },
        removeNode: (nodePath: Path) => {
            const previousNode = tryGetNode(root, nodePath, 0, nodePath.length);
            removeNodeFromTags(nodePath, previousNode.node.tags);
            removeNode(root, nodePath, 0, nodePath.length);
            if (nodePath.length > 0) {
                const parent = tryGetNode(root, nodePath, 0, nodePath.length - 1);
                if (parent != null) {
                    triggerSubscriptions(parent, [{kind: "structure", value: "children"}]);
                }
            }
        },
        tryGetNode: (nodePath: Path) => {
            const treeNode = tryGetNode(root, nodePath, 0, nodePath.length);
            if (treeNode == null) {
                return null;
            }
            return treeNode.node;
        },
        children: (nodePath: Path) => {
            const treeNode = tryGetNode(root, nodePath, 0, nodePath.length);
            if (treeNode == null) {
                return [];
            }
            return Object.keys(treeNode.children).map(x => [...nodePath, x]);
        },
        subscribe: (nodePath: Path, options: TreeSubscription) => {
            const treeNode = tryGetNode(root, nodePath, 0, nodePath.length);
            if (treeNode == null) {
                return () => {
                    /* empty unsubscribe function */
                };
            }
            const currentId = subscriptionId++;
            treeNode.subscriptions.push([currentId, options]);
            return () => {
                const deletePositions = treeNode.subscriptions.findIndex(x => x[0] === currentId);
                treeNode.subscriptions.splice(deletePositions, 1);
            };
        },
        search(tags: Tags): Path[] {
            let intersection: null | Set<string> = null;
            for (const [tagKey, tagValue] of Object.entries(tags)) {
                const current = getNodesWithTag(tagKey, tagValue);
                if (intersection == null) {
                    intersection = current;
                } else {
                    intersection = intersect(intersection, current);
                }
            }
            const nodesPath: Path[] = [];
            intersection.forEach(x => {
                const path = x === '' ? [] : x.split(".");
                nodesPath.push(path);
            })
            return nodesPath;
        },
        tags(tagKey: string): string[][] {
            if (!tagsIndex.has(tagKey)) {
                return [];
            }
            return Array.from(tagsIndex.get(tagKey).keys()).map(x => pathFromString(x));
        }
    };
}
