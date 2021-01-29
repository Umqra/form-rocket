import { createTree } from "./Tree";
import { linkTrees } from "./LinkedTrees";

test("singleConnection", () => {
    const a = createTree();
    const b = createTree();

    const linkedTree = linkTrees({a: a, b: b});
    linkedTree.connect({a: [["a", "1"]], b: [["b", "1"]]});
    expect(linkedTree.connections({a: [["a", "1"]]})).toEqual({
        a: [],
        b: [["b", "1"]]
    });
});

test("manyConnections", () => {
    const a = createTree();
    const b = createTree();
    const c = createTree();

    const linkedTree = linkTrees({a: a, b: b, c: c});
    linkedTree.connect({a: [["a", "1"]], c: [["c", "1"], ["c", "2"]]});
    linkedTree.connect({b: [["b", "1"]], c: [["c", "2"], ["c", "3"]]});
    expect(linkedTree.connections({a: [["a", "1"]], b: [["b", "1"]]})).toEqual({
        a: [],
        b: [],
        c: [["c", "2"]]
    });
    expect(linkedTree.connections({c: [["c", "1"]]})).toEqual({
        a: [["a", "1"]],
        b: [],
        c: []
    });
    expect(linkedTree.connections({c: [["c", "2"]]})).toEqual({
        a: [["a", "1"]],
        b: [["b", "1"]],
        c: []
    });
    expect(linkedTree.connections({c: [["c", "3"]]})).toEqual({
        a: [],
        b: [["b", "1"]],
        c: []
    });
});

test("noConnections", () => {
    const a = createTree();
    const b = createTree();
    const c = createTree();

    const linkedTree = linkTrees({a: a, b: b, c: c});
    expect(linkedTree.connections({a: [["a", "1"]]})).toEqual({
        a: [],
        b: [],
        c: []
    });
})
