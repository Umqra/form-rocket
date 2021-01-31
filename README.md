# form-rocket :rocket:

Experimental library for managing almost static forms.

## Basic design principles

- There is no silver bullet for form managment so you must choose/implement solutions that fit your needs.
- To be performant form managment library must use Observable pattern (like [final form](https://final-form.org/)). You don't need caches (reselect, PureComponent, memo), if changes in few controls trigger only relevant update logic.
- Form managment library must have expressive and powerful framework agnostic core. This is greatly simplify testing and also tends to the more pure code structure.

## Example
Some concrete examples you can find in the [storybook](./stories/FormRocket.stories.tsx)

To use full power of form-rocket you need the following things:

1. First, you need to mark some controls like `template`-controls which will enable some magic for them (actually, there is no magic):
```
const Input = templatify(InputControl, {kind: "data-leaf"});
const Line = templatify(LineControl, {kind: "view", tags: {caption: {kind: "fromProp", propName: "caption"}}});
```
2. Then you need to create a template of your form:
```jsx
const UserCardTemplate = (
    <ColumnStack gap={3}>
      <Fit><h2><Label path={["name"]}/> card</h2></Fit>
      <Form>
          <Line caption="Name">
            <Input path={["name"]}/>
          </Line>
          <Line caption="Address">
            <Input path={["address"]}/>
          </Line>
          <Line caption="Job title">
            <Input path={["job"]}/>
          </Line>
          <Line caption="Internal identifier" control={internalIdentifierControl}>
            <Input path={["id"]}/>
          </Line>
      </Form>
      <Button use="primary">Save</Button>
    </ColumnStack>
)
```
You can see that `Input` control have `path` prop which is special prop that recognize `form-rocket` library.

3. After this you need to preprocess this JSX template to the description of template, that form-rocket will recognize:
```js
const {templateRoot: userCardTemplate, reactRoot: userCardRoot} = processReactTemplate(UserCardTemplate);
```
Here you get `userCardTemplate` - which is representation of your `JSX` template in a plain object, and also you get `userCardRoot` - tree of `React` components with injected special components that provide all necessary data for `template`-components.

4. Now you can create the core of you form - the representation of state. State of the contains two separate parts - `view` and `data`:
```js
const trees = linkTrees({
    data: createTree(),
    view: createTree()
});
const form = createForm(trees, userCardTemplate);
```

5. Before actual rendering you can update form data:
```js
form.attach().update([], {
  name: "John",
  address: "Some street",
  job: "Some job"
});
```

6. And finally you can render your beauty form:
```js
<ReactFormContext.Provider value={trees}>
  {userCardRoot}
</ReactFormContext.Provider>
```
