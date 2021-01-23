import { createEngine } from "./FormDataTree";

test("updateNode", () => {
    const engine = createEngine();
    engine.updateNode([0, 0, 0]);
    engine.updateNode([0, 1, 0]);
    engine.updateNode([0, 0, 1]);
    expect(engine.childrenCount([0])).toEqual(2);
    expect(engine.childrenCount([0, 0])).toEqual(2);
    expect(engine.childrenCount([0, 1])).toEqual(1);
});
test("removeNode", () => {
    const engine = createEngine();
    engine.addNode([0, 0, 0]);
    engine.addNode([0, 1, 0]);
    engine.addNode([0, 0, 1]);
    engine.removeNode([0, 0, 0]);
    expect(engine.childrenCount([0])).toEqual(2);
    expect(engine.childrenCount([0, 0])).toEqual(1);
    expect(engine.childrenCount([0, 1])).toEqual(1);
});
test("addThenRemoveNode", () => {
    const engine = createEngine();
    engine.addNode([0, 0, 0]);
    engine.addNode([0, 1, 0]);
    engine.addNode([0, 0, 1]);
    engine.removeNode([0, 0, 0]);
    engine.addNode([0, 0, 0]);
    expect(engine.childrenCount([0])).toEqual(2);
    expect(engine.childrenCount([0, 0])).toEqual(2);
    expect(engine.childrenCount([0, 1])).toEqual(1);
});
// test("updateNodeData", () => {
//     const engine = createEngine();
//     engine.addNode(["root"]);
//     engine.updateNodeData(["root"], { value: "number" });
//     expect(engine.tryGetNode(["root"])?.data).toEqual({ value: "number" });
//     engine.updateNodeData(["root"], { validation: "valid" });
//     expect(engine.tryGetNode(["root"])?.data).toEqual({ value: "number", validation: "valid" });
//     engine.updateNodeData(["root"], { value: "new-number" });
//     expect(engine.tryGetNode(["root"])?.data).toEqual({ value: "new-number", validation: "valid" });
// });
// test("subscribe", () => {
//     const engine = createEngine();
//     engine.addNode(["root", "1"]);
//     engine.addNode(["root", "2"]);
//     const subscriptionCalls: any[] = [];
//     engine.subscribe(["root", "1"], {
//         update: (nodeId, data) => subscriptionCalls.push([nodeId, data]),
//         dependencies: ["value"],
//     });
//     engine.updateNodeData(["root", "2"], { value: "2" });
//     expect(subscriptionCalls).toEqual([]);
//     engine.updateNodeData(["root", "1"], { value: "1" });
//     expect(subscriptionCalls).toEqual([[["root", "1"], { data: { value: "1" }, tags: {} }]]);
//     engine.updateNodeData(["root", "1"], { validation: "valid" });
//     expect(subscriptionCalls).toEqual([[["root", "1"], { data: { value: "1" }, tags: {} }]]);
// });
// test("unsubscribe", () => {
//     const engine = createEngine();
//     engine.addNode(["root", "1"]);
//     engine.addNode(["root", "2"]);
//     const subscriptionCalls: any[] = [];
//     const unsubscribe = engine.subscribe(["root", "1"], {
//         update: (nodeId, data) => subscriptionCalls.push([nodeId, data]),
//         dependencies: ["value"],
//     });
//     engine.updateNodeData(["root", "1"], { value: "1" });
//     expect(subscriptionCalls).toEqual([[["root", "1"], { data: { value: "1" }, tags: {} }]]);
//     unsubscribe();
//     engine.updateNodeData(["root", "1"], { value: "2" });
//     expect(subscriptionCalls).toEqual([[["root", "1"], { data: { value: "1" }, tags: {} }]]);
// });
