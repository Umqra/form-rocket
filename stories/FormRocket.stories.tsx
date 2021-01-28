import * as React from "react";
import { ReactFormContext } from "../src/React/ReactFormContext";
import {createTree} from "../src/core/Tree";
import {processReactTemplate} from "../src/React/ReactTemplateProcessor";
import {MessageTemplate} from "../src/Message.form";
import {createForm} from "../src/Form";

export default {
  title: "FormRocket"
};

export const Default = () => {
  const dataTree = createTree();
  const {templateRoot: template, reactRoot: reactRoot} = processReactTemplate(MessageTemplate);
  const form = createForm(dataTree, template);
  form.update([], {
    orderNumber: "Заказ №1423",
    supplier: {name: "Хлебушек", gln: "2222222222"},
    buyer: {name: "Пятерочка", gln: "8888888888"},
    items: [
      {name: "Сыр", gtin: "GTIN-1"},
      {name: "Колбаска", gtin: "GTIN-2"}
    ]
  });
  return (
    <ReactFormContext.Provider value={dataTree}>
      {reactRoot}
    </ReactFormContext.Provider>
  );
};
