import * as React from "react";
import { createEngine } from "../src/FormDataTree";
import { FormEngineContext } from "../src/React/FormEngineContext";

export default {
  title: "FormRocket"
};

export const Default = () => {
  const formEngine = createEngine();
  formEngine.addNode(["root", "name", "value"], {
    data: { value: "Nikita Sivukhin Sergeevich" },
  });
  formEngine.addNode(["root", "address", "value"], {
    data: { value: "Ekaterinburg" },
  });
  formEngine.addNode(["root", "company", "value"], {
    data: { value: "SKB Kontur" },
  });
  setInterval(() => {
    const node = formEngine.tryGetNode(["root", "name", "value"]);
    if (node != null) {
      formEngine.updateNodeData(["root", "name", "value"], {
        ...node,
        value: node.data.value + "!",
      });
    }
  }, 1000);
  setInterval(() => {
    const node = formEngine.tryGetNode(["root", "address"]);
    if (node != null && node.data.accessibility === "visible") {
      formEngine.updateNodeData(["root", "address"], {
        ...node.data,
        accessibility: "hidden",
      });
    } else if (node != null && node.data.accessibility !== "visible") {
      formEngine.updateNodeData(["root", "address"], {
        ...node.data,
        accessibility: "visible",
      });
    }
  }, 2000);

  return (
    <FormEngineContext.Provider value={formEngine}>
      <div>Hello!</div>
    </FormEngineContext.Provider>
  );
};
