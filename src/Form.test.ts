import { createForm } from "./Form";
import { createTree } from "./core/Tree";

test("simpleForm", () => {
    const dataTree = createTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "",
        children: [
            {
                kind: "static",
                key: "title",
                tags: {path: ["title"]},
                children: []
            },
            {
                kind: "static",
                key: "user",
                children: [
                    {
                        kind: "static",
                        key: "name",
                        tags: {path: ["user", "name"]},
                        children: []
                    },
                    {
                        kind: "static",
                        key: "address",
                        tags: {path: ["user", "address"]},
                        children: []
                    }
                ]
            }
        ]
    });
    const dataTreeSubscriptions: any[] = [];
    expect(dataTree.tryGetNode(["title"])).not.toBeNull();
    dataTree.subscribe(["title"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    form.update([], {title: "User info", user: {name: "User-1", address: "Russia"}});
    expect(dataTreeSubscriptions).toEqual([
        "User info"
    ]);
    const formSubscriptions: any[] = [];
    form.subscribe({update: (path, value) => formSubscriptions.push([path, value])});
    dataTree.updateNode(["user", "name"], {data: {value: "User-2"}});
    dataTree.updateNode(["title"], {data: {value: "User card"}});
    expect(formSubscriptions).toEqual([
        [["user", "name"], "User-2"],
        [["title"], "User card"],
    ]);
});

test("arrayForm", () => {
    const dataTree = createTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "",
        children: [
            {
                kind: "static",
                key: "title",
                tags: {path: ["title"]},
                children: []
            },
            {
                kind: "array",
                key: "users",
                tags: {path: ["users"]},
                templates: {
                    kind: "static",
                    key: "user",
                    children: [
                        {
                            kind: "static",
                            key: "name",
                            tags: {path: ["name"]},
                            children: []
                        },
                        {
                            kind: "static",
                            key: "address",
                            tags: {path: ["address"]},
                            children: []
                        }
                    ]
                }
            }
        ]
    });
    const subscriptionCalls: any[] = [];
    form.update([], {title: "User list", users: [{name: "User-1", address: "Russia"}, {name: "User-2", address: "USA"}]});
    form.subscribe({update: (path, value) => subscriptionCalls.push([path, value])});
    dataTree.updateNode(["title"], {data: {value: "List"}});
    dataTree.updateNode(["users", "0", "user", "name"], {data: {value: "User-1-updated"}});
    expect(subscriptionCalls).toEqual([
        [["title"], "List"],
        [["users", "0", "name"], "User-1-updated"],
    ]);
});

test("partialUpdate", () => {
    const dataTree = createTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "",
        children: [
            {
                kind: "static",
                key: "title",
                tags: {path: ["title"]},
                children: []
            },
            {
                kind: "static",
                key: "user",
                children: [
                    {
                        kind: "static",
                        key: "name",
                        tags: {path: ["user", "name"]},
                        children: []
                    },
                    {
                        kind: "static",
                        key: "address",
                        tags: {path: ["user", "address"]},
                        children: []
                    }
                ]
            }
        ]
    });
    const dataTreeSubscriptions: any[] = [];
    form.update([], {title: "User info", user: {name: "User-1", address: "Russia"}});
    dataTree.subscribe(["title"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    dataTree.subscribe(["user", "name"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    dataTree.subscribe(["user", "address"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    form.update(["user"], {title: "User card", user: {name: "User-2", address: "USA"}});
    expect(dataTreeSubscriptions).toEqual([
        "User-2", "USA"
    ]);
    form.update([], {title: "User card", user: {name: "User-2", address: "USA"}});
    expect(dataTreeSubscriptions).toEqual([
        "User-2", "USA",
        "User card", "User-2", "USA"
    ]);
});

test("arrayNode value", () => {
    const dataTree = createTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "",
        children: [
            {
                kind: "array",
                key: "users",
                tags: {path: ["users"]},
                templates: {
                    kind: "static",
                    key: "user",
                    children: [
                        {
                            kind: "static",
                            key: "name",
                            tags: {path: ["user", "name"]},
                            children: []
                        }
                    ]
                }
            }
        ]
    });
    form.update([], {users: [{name:"A"}, {name: "B"}, {name: "C"}]});
    expect(dataTree.tryGetNode(["users"]).data.value).toEqual(["0", "1", "2"]);
    form.update([], {users: [{name:"A"}, {name: "C"}]});
    expect(dataTree.tryGetNode(["users"]).data.value).toEqual(["0", "1"]);
    form.update([], {users: [{name:"A"}, {name: "C"}, {name: "D"}, {name: "E"}]});
    expect(dataTree.tryGetNode(["users"]).data.value).toEqual(["0", "1", "2", "3"]);
});
