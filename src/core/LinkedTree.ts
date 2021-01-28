import {Tree, Path} from "./Tree";

type LinkedTreesArgs = {
    [key: string]: Tree;
}

type LinkedTreesPath<TLinkedTrees> = {
    [P in keyof TLinkedTrees]: Path[];
}

type LinkedTree<TLinkedTrees extends LinkedTreesArgs> = {
    [P in keyof TLinkedTrees]: Tree;
} & {
    connect(nodes: Partial<LinkedTreesPath<TLinkedTrees>>): void;
    connections(nodes: Partial<LinkedTreesPath<TLinkedTrees>>): LinkedTreesPath<TLinkedTrees>;
}

function createLinkedTree<TLinkedTrees extends LinkedTreesArgs>(trees: TLinkedTrees): LinkedTree<TLinkedTrees> {
    return {
        ...trees,
        connect(nodes: LinkedTreesPath<TLinkedTrees>) {},
        connections(nodes: LinkedTreesPath<TLinkedTrees>): LinkedTreesPath<TLinkedTrees> {
            // @ts-ignore
            return {};
        }
    };
}