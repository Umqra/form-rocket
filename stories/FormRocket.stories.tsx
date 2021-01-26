import * as React from "react";
import { ReactFormContext } from "../src/React/ReactFormContext";
import {createDataTree} from "../src/FormDataTree";
import {processReactTemplate} from "../src/React/ReactTemplateProcessor";
import {MessageTemplate} from "../src/Message.form";
import {createForm} from "../src/Form";

export default {
  title: "FormRocket"
};

export const Default = () => {
  const dataTree = createDataTree();
  const {templateRoot: template, reactRoot: reactRoot} = processReactTemplate(MessageTemplate);
  const form = createForm(dataTree, template);
  console.info(template);
  form.update([], {
    orderNumber: "Заказ №1423",
    supplier: {name: "Хлебушек", gln: "2222222222"},
    buyer: {name: "Пятерочка", gln: "8888888888"},
    items: [
      {gtin: "1", name: "Сыр"},
      {gtin: "2", name: "Сыр"},
      {gtin: "3", name: "Сыр"},
      {gtin: "4", name: "Сыр"},
      {gtin: "5", name: "Сыр"},
    ]
  });
  console.info(dataTree.children([]));
  return (
    <ReactFormContext.Provider value={dataTree}>
      {reactRoot}
    </ReactFormContext.Provider>
  );
};
