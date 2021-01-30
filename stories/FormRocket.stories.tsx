import * as React from "react";
import { ReactFormContext } from "../src/react/ReactFormContext";
import {createTree} from "../src/core/Tree";
import {processReactTemplate} from "../src/react/ReactTemplateProcessor";
import {MessageTemplate} from "../src/Message.form";
import {createForm} from "../src/Form";
import {linkTrees} from "../src/core/LinkedTrees";

export default {
  title: "FormRocket"
};

export const Default = () => {
  const trees = linkTrees({
    data: createTree(),
    view: createTree()
  });
  const {templateRoot: template, reactRoot: reactRoot} = processReactTemplate(MessageTemplate);
  const form = createForm(trees, template);
  const {update} = form.attach();
  update([], {
    orderNumber: "Заказ №1423",
    supplier: {name: "Хлебушек", gln: "2222222222"},
    buyer: {name: "Пятерочка", gln: "8888888888"},
    items: [
      {name: "Сыр", gtin: "GTIN-1"},
      {name: "Колбаска", gtin: "GTIN-2"}
    ]
  });
  console.info(trees.view.tags("caption"));
  return (
    <ReactFormContext.Provider value={trees}>
      {reactRoot}
    </ReactFormContext.Provider>
  );
};
