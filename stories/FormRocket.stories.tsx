import * as React from "react";
import faker from "faker";
import { ReactFormContext } from "../src/react/ReactFormContext";
import {createTree, Tree} from "../src/core/Tree";
import {processReactTemplate} from "../src/react/ReactTemplateProcessor";
import {createForm} from "../src/Form";
import {linkTrees} from "../src/core/LinkedTrees";
import {Button, Checkbox, Link, Loader, Modal, SidePage, Toggle} from "@skbkontur/react-ui";
import {ColumnStack, Fit, RowStack} from "@skbkontur/react-stack-layout";
import {Form} from "../src/controls/Form";
import {Line, Input, Label, Section, Many} from "../src/TemplateControls";
import {createControl} from "../src/FormTemplate";
import {templatify} from "../src/react/ReactConnect";
import {PathIndex} from "../src/controls/PathIndex";

export default {
  title: "FormRocket"
};

const internalIdentifierControl = createControl();
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
const {templateRoot: userCardTemplate, reactRoot: userCardRoot} = processReactTemplate(UserCardTemplate);

export const UserCard = () => {
  const [{trees, form}] = React.useState(() => {
    const trees = linkTrees({
      data: createTree(),
      view: createTree()
    });
    const form = createForm(trees, userCardTemplate);
    const {update} = form.attach();
    update([], {
      name: "John",
      address: "Some street",
      job: "Some job"
    });
    internalIdentifierControl.update(form, {visibility: "hidden"});
    return {trees, form};
  });
  return (
      <ReactFormContext.Provider value={trees}>
        {userCardRoot}
      </ReactFormContext.Provider>
  );
}

export const UserCardForAdmins = () => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [{trees, form}] = React.useState(() => {
    const trees = linkTrees({
      data: createTree(),
      view: createTree()
    });
    const form = createForm(trees, userCardTemplate);
    const {update} = form.attach();
    update([], {
      name: "John",
      address: "Some street",
      job: "Some job"
    });
    return {trees, form};
  });
  React.useEffect(() => {
    internalIdentifierControl.update(form, {visibility: isAdmin ? "show" : "hidden"});
  }, [isAdmin]);
  return (
      <ColumnStack gap={3}>
        <Fit>
          <Toggle checked={isAdmin} onValueChange={x => setIsAdmin(x)}>Admin view</Toggle>
        </Fit>
        <Fit>
          <ReactFormContext.Provider value={trees}>
            {userCardRoot}
          </ReactFormContext.Provider>
        </Fit>
      </ColumnStack>
  );
}

const ConfigureFieldsControl = templatify(function({value, onChange}: {value: Tree, onChange: (x: any) => void}) {
  const [showConfiguration, setShowConfiguration] = React.useState(false);
  return (
      <>
        <Link onClick={() => setShowConfiguration(true)}>configure fields</Link>
        {showConfiguration && <SidePage onClose={() => setShowConfiguration(false)}>
          <SidePage.Header>
            Configure form fields
          </SidePage.Header>
          <SidePage.Body>
            <ColumnStack style={{marginLeft: "20px"}}>
              {value.tags("caption").map(x => {
                const nodes = value.search({caption: x});
                const checked = nodes.every(x => value.tryGetNode(x).data.visibility !== "hidden");
                return (
                  <Fit style={{marginLeft: `${20 * (x.length - 1)}px`}}>
                    <Checkbox checked={checked} onValueChange={x => {
                      for (const node of nodes) {
                        value.updateNode(node, {data: {visibility: x ? "show" : "hidden"}});
                        onChange(value);
                      }
                    }}>{x[x.length - 1]}</Checkbox>
                  </Fit>
                );
              })}
            </ColumnStack>
          </SidePage.Body>
        </SidePage>}
      </>
  );
}, {kind: "view"});

const configureFieldsControl = createControl();
const BigUserCardTemplate = (
    <ColumnStack gap={3}>
      <Fit>
        <RowStack verticalAlign="center" gap={3}>
          <Fit>
            <h2><Label path={["name"]}/> card</h2>
          </Fit>
          <Fit>
            <ConfigureFieldsControl control={configureFieldsControl}/>
          </Fit>
        </RowStack>
      </Fit>
      <Form>
        <Section caption="Basic information">
          <Line caption="Name">
            <Input path={["basic", "name"]}/>
          </Line>
          <Line caption="Address">
            <Input path={["basic", "address"]}/>
          </Line>
          <Line caption="Job title">
            <Input path={["basic", "job"]}/>
          </Line>
        </Section>
        <Section caption="Interests">
          <Line caption="Music">
            <Input path={["interests", "music"]}/>
          </Line>
          <Line caption="Books">
            <Input path={["interests", "books"]}/>
          </Line>
          <Line caption="Hobbies">
            <Input path={["interests", "hobbies"]}/>
          </Line>
        </Section>
        <Section caption="Contacts">
          <Line caption="Email">
            <Input path={["contacts", "email"]}/>
          </Line>
          <Line caption="Phone">
            <Input path={["contacts", "phone"]}/>
          </Line>
        </Section>
      </Form>
      <Button use="primary">Save</Button>
    </ColumnStack>
)
const {templateRoot: bigUserCardTemplate, reactRoot: bigUserCardRoot} = processReactTemplate(BigUserCardTemplate);

export const BigUserCard = () => {
  const [{trees, form}] = React.useState(() => {
    const trees = linkTrees({
      data: createTree(),
      view: createTree()
    });
    const form = createForm(trees, bigUserCardTemplate);
    const {update} = form.attach();
    update([], {
      name: "John",
      address: "Some street",
      job: "Some job"
    });
    configureFieldsControl.update(form, {value: trees.view});
    return {trees, form};
  });
  return (
      <ReactFormContext.Provider value={trees}>
        {bigUserCardRoot}
      </ReactFormContext.Provider>
  );
}

const Header = templatify(function({header}: {header: string}) {
  return <th>{header}</th>
}, {kind: "view", tags: {header: {kind: "fromProp", propName: "header"}}});

const Cell = templatify(function({children}: React.PropsWithChildren<{header: string}>) {
  return <td>{children}</td>;
}, {kind: "view", tags: {header: {kind: "fromProp", propName: "header"}}});

const UserListTemplate = (
    <table>
      <tr>
        <Header header="№"/>
        <Header header="Name"/>
        <Header header="Address"/>
        <Header header="Job title"/>
        <Header header="Email"/>
        <Header header="Phone"/>
        <Header header="Visits"/>
        <Header header="Balance"/>
        <Header header="Repository"/>
      </tr>
      <Many path={["users"]}>
          <tr>
              <Cell header="№"><PathIndex position={1} /></Cell>
              <Cell header="Name"><Input path={["name"]}/></Cell>
              <Cell header="Address"><Input path={["address"]}/></Cell>
              <Cell header="Job title"><Input path={["job"]}/></Cell>
              <Cell header="Email"><Input path={["email"]}/></Cell>
              <Cell header="Phone"><Input path={["phone"]}/></Cell>
              <Cell header="Visits"><Input path={["visits"]}/></Cell>
              <Cell header="Balance"><Input path={["balance"]}/></Cell>
              <Cell header="Repository"><Input path={["repository"]}/></Cell>
          </tr>
      </Many>
    </table>
);
const {templateRoot: userListTemplate, reactRoot: userListRoot} = processReactTemplate(UserListTemplate);

export const UserList = () => {
  const [loaded, setLoaded] = React.useState(false);
  const [{trees, form}] = React.useState(() => {
    const trees = linkTrees({
      data: createTree(),
      view: createTree()
    });
    const form = createForm(trees, userListTemplate);
    form.attach().update([], {
      users: [
          {
              name: "Name",
              address: "Address",
              job: "Job",
              email: "Email",
              phone: "Phone",
              visits: "Visits",
              balance: "Balance",
              repository: "Repository"
          }
      ]
    });
    return {trees, form};
  });
  React.useEffect(() => {
    setTimeout(() => {
      const {update} = form.attach();
      update([], {
        users: new Array(128).fill(undefined).map(_ => ({
          name: faker.name.firstName() + " " + faker.name.lastName(),
          address: faker.address.city(),
          job: faker.name.jobTitle(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
          visits: faker.random.number(),
          balance: faker.random.number(),
          repository: faker.internet.url()
        }))
      });
      setLoaded(true);
    }, 1000);
  }, []);
  return (
      <Loader active={!loaded}>
        <ReactFormContext.Provider value={trees}>
          {userListRoot}
        </ReactFormContext.Provider>
      </Loader>
  );
}

