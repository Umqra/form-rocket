import { createTree } from "./Tree";

test("updateNode", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "a", "0"]);
    dataTree.updateNode(["root", "b", "1"]);
    dataTree.updateNode(["root", "a", "1"]);
    expect(dataTree.children(["root"])).toEqual([["root", "a"], ["root", "b"]]);
    expect(dataTree.children(["root", "a"])).toEqual([["root", "a", "0"], ["root", "a", "1"]]);
    expect(dataTree.children(["root", "b"])).toEqual([["root", "b", "1"]]);
});

test("updateNodeWithData", () => {
    const dataTree = createTree();
    const leafData = {data: {value: "first", validation: "valid"}, tags: {type: "simple", subtype: "extra-simple"}}
    const internalData = {data: {context: "user-id"}, tags: {name: "Field-Name"}};
    dataTree.updateNode(["root", "a", "0"], leafData);
    expect(dataTree.tryGetNode(["root"])).toEqual({data: {}, tags: {}});
    expect(dataTree.tryGetNode(["root", "a"])).toEqual({data: {}, tags: {}});
    expect(dataTree.tryGetNode(["root", "b"])).toBeNull();
    expect(dataTree.tryGetNode(["root", "a", "0"])).toEqual(leafData);
    dataTree.updateNode(["root", "a"], internalData);
    expect(dataTree.tryGetNode(["root", "a"])).toEqual(internalData);
    dataTree.updateNode(["root", "a", "0"], internalData);
    expect(dataTree.tryGetNode(["root", "a", "0"])).toEqual({
        data: {
            value: "first",
            validation: "valid",
            context: "user-id"
        },
        tags: {
            type: "simple",
            subtype: "extra-simple",
            name: "Field-Name"
        }
    });
});

test("removeLeafNode", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "a", "0"]);
    dataTree.updateNode(["root", "b", "1"]);
    dataTree.updateNode(["root", "a", "1"]);
    dataTree.removeNode(["root", "a", "0"]);
    expect(dataTree.children(["root"])).toEqual([["root", "a"], ["root", "b"]]);
    expect(dataTree.children(["root", "a"])).toEqual([["root", "a", "1"]]);
    expect(dataTree.children(["root", "b"])).toEqual([["root", "b", "1"]]);
});

test("removeInternalNode", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "a", "0"]);
    dataTree.updateNode(["root", "b", "1"]);
    dataTree.updateNode(["root", "a", "1"]);
    dataTree.removeNode(["root", "a"]);
    expect(dataTree.children(["root"])).toEqual([ ["root", "b"]]);
    expect(dataTree.children(["root", "b"])).toEqual([["root", "b", "1"]]);
});

test("addThenRemoveNode", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "a", "0"]);
    dataTree.updateNode(["root", "b", "1"]);
    dataTree.updateNode(["root", "a", "1"]);
    dataTree.removeNode(["root", "a", "0"]);
    dataTree.updateNode(["root", "a", "0"]);
    expect(dataTree.children(["root"])).toEqual([["root", "a"], ["root", "b"]]);
    expect(dataTree.children(["root", "a"])).toEqual([["root", "a", "0"], ["root", "a", "1"]]);
    expect(dataTree.children(["root", "b"])).toEqual([["root", "b", "1"]]);
});

test("subscribeDataUpdate", () => {
    let payloadId = 1;
    const payload = () => {
        return {data: {value: payloadId++}};
    }
    const dataTree = createTree();
    dataTree.updateNode(["root", "1"], payload());
    dataTree.updateNode(["root", "2"], payload());
    const subscriptionCalls: any[] = [];
    dataTree.subscribe(["root", "1"], {
        notify: (node) => subscriptionCalls.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    dataTree.updateNode(["root", "2"], payload());
    expect(subscriptionCalls).toEqual([]);
    dataTree.updateNode(["root", "1"], payload());
    expect(subscriptionCalls).toEqual([4]);
    dataTree.updateNode(["root", "1"], {data: { validation: "valid" }});
    expect(subscriptionCalls).toEqual([4]);
});

test("subscribeChildrenUpdate", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "a", "0"]);
    const subscriptionCalls: any[] = [];
    dataTree.subscribe(["root", "a"], {
        notify: (node) => subscriptionCalls.push(dataTree.children(["root", "a"])),
        dependencies: [{kind: "structure", value: "children"}]
    });
    dataTree.updateNode(["root", "a", "0"], {data: {value: "first"}});
    expect(subscriptionCalls).toEqual([]);
    dataTree.updateNode(["root", "a", "1"]);
    expect(subscriptionCalls).toEqual([
        [["root", "a", "0"], ["root", "a", "1"]]
    ]);
    dataTree.removeNode(["root", "a", "0"]);
    expect(subscriptionCalls).toEqual([
        [["root", "a", "0"], ["root", "a", "1"]],
        [["root", "a", "1"]]
    ]);
    dataTree.updateNode(["root", "a", "1", "child"]);
    expect(subscriptionCalls).toEqual([
        [["root", "a", "0"], ["root", "a", "1"]],
        [["root", "a", "1"]]
    ]);
});

test("unsubscribe", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "1"]);
    dataTree.updateNode(["root", "2"]);
    const subscriptionCalls: any[] = [];
    const unsubscribe = dataTree.subscribe(["root", "1"], {
        notify: (node) => subscriptionCalls.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    dataTree.updateNode(["root", "1"], {data: {value: 1}});
    expect(subscriptionCalls).toEqual([1]);
    unsubscribe();
    dataTree.updateNode(["root", "1"], {data: {value: 2}});
    expect(subscriptionCalls).toEqual([1]);
});

test("tag search", () => {
    const dataTree = createTree();
    dataTree.updateNode(["root", "1"], {tags: {type: "huge", visible: "yes"}});
    dataTree.updateNode(["root", "2"], {tags: {type: "small", visible: "no"}});
    dataTree.updateNode(["root", "3"], {tags: {type: "small", visible: "yes"}});
    dataTree.updateNode(["root", "4"], {tags: {type: "huge", visible: "yes"}});
    expect(dataTree.search({type: "huge"})).toEqual([
        ["root", "1"],
        ["root", "4"]
    ]);
    expect(dataTree.search({type: "small", visible: "no"})).toEqual([
        ["root", "2"]
    ]);
    expect(dataTree.search({type: "huge", visible: "no"})).toEqual([]);
    dataTree.removeNode(["root", "1"]);
    expect(dataTree.search({type: "huge"})).toEqual([
        ["root", "4"]
    ]);
});