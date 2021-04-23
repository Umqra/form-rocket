import {processTemplate} from "./FormState";
import {combine, forward} from "effector";
import {ValidationInfo} from "@skbkontur/react-ui-validations";

test("test", () => {
    const {data, view} = processTemplate({
        viewId: "",
        children: [
            {
                viewId: "parties",
                children: [
                    {
                        viewId: "parties.buyer",
                        dataId: "buyer",
                        children: [
                            {
                                viewId: "parties.buyer.name",
                                dataId: "buyer.name",
                                children: []
                            },
                            {
                                viewId: "parties.buyer.address",
                                dataId: "buyer.address",
                                children: []
                            }
                        ]
                    },
                    {
                        viewId: "parties.supplier",
                        dataId: "supplier",
                        children: [
                            {
                                viewId: "parties.supplier.name",
                                dataId: "supplier.name",
                                children: []
                            },
                            {
                                viewId: "parties.supplier.address",
                                dataId: "supplier.address",
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    });
    function partyValidator([name, address]: [string, string]) {
        if (name == null) {
            return {level: "error", message: "Название должно быть заполнено"};
        }
        if (address == null) {
            return {level: "error", message: "Адрес должен быть заполнен"};
        }
        if (name.length > 10) {
            return {level: "error", message: "Название должно содержать не более 10 символов"};
        }
    }
    forward({
        from: combine([data.buyer.name.$value, data.buyer.address.$value], partyValidator),
        to: data.buyer.$validation
    });
    forward({
        from: combine([data.supplier.name.$value, data.supplier.address.$value], partyValidator),
        to: data.supplier.$validation
    });
})
