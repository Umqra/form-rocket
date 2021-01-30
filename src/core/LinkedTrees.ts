import {Tree, Path} from "./Tree";
import {intersect} from "./SetUtils";
import {pathFromString, pathToString} from "./PathUtils";

type LinkedTreesArgs = {
    [key: string]: Tree;
}

type LinkedTreesPath<TLinkedTrees> = {
    [P in keyof TLinkedTrees]: Path[];
}

export type LinkedTrees<TLinkedTrees extends LinkedTreesArgs> = {
    [P in keyof TLinkedTrees]: Tree;
} & {
    connect(nodes: Partial<LinkedTreesPath<TLinkedTrees>>): void;
    connections(nodes: Partial<LinkedTreesPath<TLinkedTrees>>): LinkedTreesPath<TLinkedTrees>;
}

function getKey(treeName: string, path: Path) {
    return treeName + ":" + pathToString(path);
}

export function linkTrees<TLinkedTrees extends LinkedTreesArgs>(trees: TLinkedTrees): LinkedTrees<TLinkedTrees> {
    const connections: Map<string, Set<string>> = new Map();
    return {
        ...trees,
        connect(nodes: LinkedTreesPath<TLinkedTrees>) {
            for (const sourceTree of Object.keys(nodes)) {
                for (const targetTree of Object.keys(nodes)) {
                    if (sourceTree === targetTree) {
                        continue;
                    }
                    for (const a of nodes[sourceTree]) {
                        for (const b of nodes[targetTree]) {
                            const sourceKey = getKey(sourceTree, a);
                            const targetKey = getKey(targetTree, b);
                            if (!connections.has(sourceKey))
                                connections.set(sourceKey, new Set());
                            connections.get(sourceKey).add(targetKey);
                        }
                    }
                }
            }
        },
        connections(nodes: LinkedTreesPath<TLinkedTrees>): LinkedTreesPath<TLinkedTrees> {
            let intersection: Set<string> | null = null;
            for (const sourceTree of Object.keys(nodes)) {
                for (const a of nodes[sourceTree]) {
                    const key = getKey(sourceTree, a);
                    const current = connections.has(key) ? connections.get(key) : new Set<string>();
                    if (intersection == null) {
                        intersection = current;
                    } else {
                        intersection = intersect(intersection, current);
                    }
                }
            }
            // @ts-ignore
            const result: LinkedTreesPath<TLinkedTrees> = Object.fromEntries(Object.keys(trees).map(x => [x, []]));
            intersection.forEach(x => {
                const [treeName, pathString] = x.split(":");
                const path = pathFromString(pathString);
                if (!result.hasOwnProperty(treeName)) {
                    // @ts-ignore
                    result[treeName] = [];
                }
                result[treeName].push(path);
            })
            return result;
        }
    };
}