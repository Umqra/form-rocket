import { createForm } from "./Form";
import { createDataTree } from "./FormDataTree";

test("simpleForm", () => {
    const dataTree = createDataTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "root",
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
    expect(dataTree.tryGetNode(["root", "title"])).not.toBeNull();
    dataTree.subscribe(["root", "title"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    form.update(["root"], {title: "User info", user: {name: "User-1", address: "Russia"}});
    expect(dataTreeSubscriptions).toEqual([
        "User info"
    ]);
    const formSubscriptions: any[] = [];
    form.subscribe({update: (path, value) => formSubscriptions.push([path, value])});
    dataTree.updateNode(["root", "user", "name"], {data: {value: "User-2"}});
    dataTree.updateNode(["root", "title"], {data: {value: "User card"}});
    expect(formSubscriptions).toEqual([
        [["user", "name"], "User-2"],
        [["title"], "User card"],
    ]);
});

test("arrayForm", () => {
    const dataTree = createDataTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "root",
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
                template: {
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
    form.update(["root"], {title: "User list", users: [{name: "User-1", address: "Russia"}, {name: "User-2", address: "USA"}]});
    form.subscribe({update: (path, value) => subscriptionCalls.push([path, value])});
    dataTree.updateNode(["root", "title"], {data: {value: "List"}});
    dataTree.updateNode(["root", "users", "0", "user", "name"], {data: {value: "User-1-updated"}});
    expect(subscriptionCalls).toEqual([
        [["title"], "List"],
        [["users", "0", "name"], "User-1-updated"],
    ]);
});

test("partialUpdate", () => {
    const dataTree = createDataTree();
    const form = createForm(dataTree, {
        kind: "static",
        key: "root",
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
    form.update(["root"], {title: "User info", user: {name: "User-1", address: "Russia"}});
    dataTree.subscribe(["root", "title"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    dataTree.subscribe(["root", "user", "name"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    dataTree.subscribe(["root", "user", "address"], {
        update: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    form.update(["root", "user"], {title: "User card", user: {name: "User-2", address: "USA"}});
    expect(dataTreeSubscriptions).toEqual([
        "User-2", "USA"
    ]);
    form.update(["root"], {title: "User card", user: {name: "User-2", address: "USA"}});
    expect(dataTreeSubscriptions).toEqual([
        "User-2", "USA",
        "User card", "User-2", "USA"
    ]);
});
