export type Path = string[];

export interface FormDataTreeNode {
    tags: { [key: string]: string };
    data: { [key: string]: any };
}

type FormDataTreeNodeOptional = Partial<FormDataTreeNode>;

type SubscriptionDependency = {data: string} | {tag: string} | {structure: "children"}

interface FormDataTreeSubscription {
    update: (data: FormDataTreeNode) => void;
    dependencies: SubscriptionDependency[];
}

export interface FormDataTree {
    updateNode(nodePath: Path, node?: FormDataTreeNodeOptional): void;
    removeNode(nodePath: Path): void;
    tryGetNode(nodePath: Path): FormDataTreeNode | null;
    children(nodePath: Path): Path[];
    subscribe(nodePath: Path, subscription: FormDataTreeSubscription): () => void;
}

interface TreeNode {
    children: {
        [key: string]: TreeNode
    };
    dataNode: FormDataTreeNode;
    subscriptions: Array<[number, FormDataTreeSubscription]>;
}

function createEmptyNode(): TreeNode {
    return {
        children: {},
        dataNode: { data: {}, tags: {} },
        subscriptions: [],
    };
}

function addNode(root: TreeNode, nodePath: Path, l: number, r: number): TreeNode {
    if (l >= r) {
        return root;
    }
    const id = nodePath[l];
    if (!root.children.hasOwnProperty(id)) {
        root.children[id] = createEmptyNode();
    }
    return addNode(root.children[id], nodePath, l + 1, r);
}

function getNode(root: TreeNode, nodePath: Path, l: number, r: number): TreeNode | null {
    if (l >= r) {
        return root;
    }
    const id = nodePath[l];
    if (!root.children.hasOwnProperty(id)) {
        return null;
    }
    return getNode(root.children[id], nodePath, l + 1, r);
}

function removeNode(root: TreeNode, nodePath: Path, l: number, r: number) {
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

function triggerSubscriptions(node: TreeNode, changes: SubscriptionDependency[]) {
    // todo (sivukhin, 19.01.2021): Optimize subscription evaluation with some sort of index?
    for (const [_, subscription] of node.subscriptions) {
        subscription.dependencies[0].
    }
}

export function createEngine(): FormDataTree {
    const root = createEmptyNode();
    let subscriptionId = 0;
    return {
        updateNode(nodePath: Path, node?: FormDataTreeNodeOptional) {
            {
                const previousNode = getNode(root, nodePath, 0, nodePath.length);
                const currentNode = addNode(root, nodePath, 0, nodePath.length);

                const dependencies: SubscriptionDependency[] = [];
                if (node != null && node.data != null) {
                    currentNode.dataNode.data = node.data;
                    dependencies.push(...Object.keys(node.data).map(x => ({data: x})))
                }
                if (node != null && node.tags != null) {
                    currentNode.dataNode.tags = node.tags;
                    dependencies.push(...Object.keys(node.tags).map(x => ({tag: x})))
                }

                if (dependencies.length > 0) {
                    triggerSubscriptions(currentNode, dependencies);
                }

                if (previousNode == null) {
                    const parent = getNode(root, nodePath, 0, nodePath.length - 1);
                    if (parent != null) {
                        triggerSubscriptions(parent, [{structure: "children"}]);
                    }
                }
            }
        },
        removeNode: (nodePath: Path) => {
            removeNode(root, nodePath, 0, nodePath.length);
            if (nodePath.length > 0) {
                const parent = getNode(root, nodePath, 0, nodePath.length - 1);
                if (parent != null) {
                    triggerSubscriptions(parent, [{structure: "children"}]);
                }
            }
        },
        tryGetNode: (nodePath: Path) => {
            const treeNode = getNode(root, nodePath, 0, nodePath.length);
            if (treeNode == null) {
                return null;
            }
            return treeNode.dataNode;
        },
        children: (nodePath: Path) => {
            const treeNode = getNode(root, nodePath, 0, nodePath.length);
            if (treeNode == null) {
                return [];
            }
            return Object.keys(treeNode.children).map(x => [...nodePath, x]);
        },
        subscribe: (nodePath: Path, options: FormDataTreeSubscription) => {
            const treeNode = getNode(root, nodePath, 0, nodePath.length);
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
    };
}
