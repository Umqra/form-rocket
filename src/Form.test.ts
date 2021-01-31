import { createForm } from "./Form";
import { createTree } from "./core/Tree";
import {linkTrees} from "./core/LinkedTrees";
import {createControl} from "./FormTemplate";

test("simpleForm", () => {
    const trees = linkTrees({
        data: createTree(),
        view: createTree()
    })
    const form = createForm(trees, {
        kind: "view",
        viewKey: "",
        children: [
            {
                kind: "data-leaf",
                viewKey: "title",
                dataPath: ["title"]
            },
            {
                kind: "view",
                viewKey: "user",
                children: [
                    {
                        kind: "data-leaf",
                        viewKey: "name",
                        dataPath: ["user", "name"],
                    },
                    {
                        kind: "data-leaf",
                        viewKey: "address",
                        dataPath: ["user", "address"],
                    }
                ]
            }
        ]
    });
    const dataTreeSubscriptions: any[] = [];
    expect(trees.data.tryGetNode(["title"])).not.toBeNull();
    trees.data.subscribe(["title"], {
        notify: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    let lastFormSubscription: any = null;
    const {update, unsubscribe} = form.attach({
        notify: (update, changes) => lastFormSubscription = [update, changes]
    });
    update([], {title: "User info", user: {name: "User-1", address: "Russia"}});
    expect(lastFormSubscription).toBeNull();
    trees.data.updateNode(["user", "name"], {data: {value: "User-2"}});
    expect(lastFormSubscription).toEqual([
        {title: "User info", user: {name: "User-2", address: "Russia"}},
        [["user", "name"]]
    ]);
    trees.data.updateNode(["title"], {data: {value: "User card"}});
    expect(lastFormSubscription).toEqual([
        {title: "User card", user: {name: "User-2", address: "Russia"}},
        [["title"]]
    ]);
});

test("arrayForm", () => {
    const trees = linkTrees({
        data: createTree(),
        view: createTree()
    });
    const form = createForm(trees, {
        kind: "view",
        viewKey: "",
        children: [
            {
                kind: "data-leaf",
                viewKey: "title",
                dataPath: ["title"],
            },
            {
                kind: "data-array",
                viewKey: "users",
                dataPath: ["users"],
                templates: [
                    {
                        kind: "view",
                        viewKey: "user",
                        children: [
                            {
                                kind: "data-leaf",
                                viewKey: "name",
                                dataPath: ["name"],
                            },
                            {
                                kind: "data-leaf",
                                viewKey: "address",
                                dataPath: ["address"],
                            }
                        ]
                    }
                ]
            }
        ]
    });
    let lastSubscriptionCall: any = null;
    const {update} = form.attach({
        notify: (update, changes) => lastSubscriptionCall = [update, changes]
    });
    update([], {title: "User list", users: [{name: "User-1", address: "Russia"}, {name: "User-2", address: "USA"}]});
    trees.data.updateNode(["title"], {data: {value: "List"}});
    expect(lastSubscriptionCall).toEqual([
        {title: "List", users: [{name: "User-1", address: "Russia"}, {name: "User-2", address: "USA"}]},
        [["title"]]
    ]);
    trees.data.updateNode(["users", "0", "name"], {data: {value: "User-1-updated"}});
    expect(lastSubscriptionCall).toEqual([
        {title: "List", users: [{name: "User-1-updated", address: "Russia"}, {name: "User-2", address: "USA"}]},
        [["users", "0", "name"]]
    ]);
});

test("partialUpdate", () => {
    const trees = linkTrees({
        data: createTree(),
        view: createTree()
    });
    const form = createForm(trees, {
        kind: "view",
        viewKey: "",
        children: [
            {
                kind: "data-leaf",
                viewKey: "title",
                dataPath: ["title"],
            },
            {
                kind: "view",
                viewKey: "user",
                children: [
                    {
                        kind: "data-leaf",
                        viewKey: "name",
                        dataPath: ["user", "name"],
                    },
                    {
                        kind: "data-leaf",
                        viewKey: "address",
                        dataPath: ["user", "address"],
                    }
                ]
            }
        ]
    });
    const dataTreeSubscriptions: any[] = [];
    const {update} = form.attach();
    update([], {title: "User info", user: {name: "User-1", address: "Russia"}});
    trees.data.subscribe(["title"], {
        notify: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    trees.data.subscribe(["user", "name"], {
        notify: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    trees.data.subscribe(["user", "address"], {
        notify: (node) => dataTreeSubscriptions.push(node.data.value),
        dependencies: [{kind: "data", value: "value"}]
    });
    update(["user", "name"], "User-2");
    update(["user", "address"], "USA");
    expect(dataTreeSubscriptions).toEqual([
        "User-2", "USA"
    ]);
    update([], {title: "User card", user: {name: "User-2", address: "USA"}});
    expect(dataTreeSubscriptions).toEqual([
        "User-2", "USA",
        "User card", "User-2", "USA"
    ]);
});

test("arrayNode value", () => {
    const trees = linkTrees({
        data: createTree(),
        view: createTree()
    })
    const form = createForm(trees, {
        kind: "view",
        viewKey: "",
        children: [
            {
                kind: "data-array",
                viewKey: "users",
                dataPath: ["users"],
                templates: [
                    {
                        kind: "view",
                        viewKey: "user",
                        children: [
                            {
                                kind: "data-leaf",
                                viewKey: "name",
                                dataPath: ["user", "name"],
                            }
                        ]
                    }
                ]
            }
        ]
    });
    const {update} = form.attach();
    update([], {users: [{name:"A"}, {name: "B"}, {name: "C"}]});
    expect(trees.data.tryGetNode(["users"]).data.value).toEqual(["0", "1", "2"]);
    update([], {users: [{name:"A"}, {name: "C"}]});
    expect(trees.data.tryGetNode(["users"]).data.value).toEqual(["0", "1"]);
    update([], {users: [{name:"A"}, {name: "C"}, {name: "D"}, {name: "E"}]});
    expect(trees.data.tryGetNode(["users"]).data.value).toEqual(["0", "1", "2", "3"]);
});

test("viewSubscription", () => {
    const trees = linkTrees({
        data: createTree(),
        view: createTree()
    })
    const userNameControl = createControl();
    const form = createForm(trees, {
        kind: "view",
        viewKey: "",
        children: [
            {
                kind: "data-array",
                viewKey: "users",
                dataPath: ["users"],
                templates: [
                    {
                        kind: "view",
                        viewKey: "user",
                        children: [
                            {
                                kind: "data-leaf",
                                viewKey: "name",
                                control: userNameControl,
                                dataPath: ["user", "name"],
                            }
                        ]
                    }
                ]
            }
        ]
    });
    const {update} = form.attach();
    update([], {users: [{name:"A"}, {name: "B"}, {name: "C"}]});
    userNameControl.update({visibility: "hidden"});
    expect(trees.view.tryGetNode(["users", "0", "user", "name"]).data).toEqual({
        visibility: "hidden"
    });
    expect(trees.view.tryGetNode(["users", "1", "user", "name"]).data).toEqual({
        visibility: "hidden"
    });
    expect(trees.view.tryGetNode(["users", "2", "user", "name"]).data).toEqual({
        visibility: "hidden"
    });
    update([], {users: [{name: "A"}, {name: "B"}, {name: "C"}, {name: "D"}]});
    expect(trees.view.tryGetNode(["users", "3", "user", "name"]).data).toEqual({
        visibility: "hidden"
    });
})
