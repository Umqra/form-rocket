import * as React from "react";
import {Form} from "./Controls/Form";
import {Array, Input} from "./TemplateControls";
import {Line} from "./Controls/Line";

interface Party {
    name: string;
    gln: string;
}

interface GoodItem {
    gtin: string;
    name: string;
    quantity: number;
}

interface Message {
    orderNumber: string;
    supplier: Party;
    buyer: Party;
    goodItems: GoodItem[];
}

export const MessageTemplate = (
    <Form>
        <Line caption={"Номер заказа"}>
            <Input path={["orderNumber"]}/>
        </Line>
        <Line caption={"Поставщик"}>
            <Line caption={"Наименование"}>
                <Input path={["supplier", "name"]}/>
            </Line>
            <Line caption={"GLN"}>
                <Input path={["supplier", "gln"]}/>
            </Line>
        </Line>
        <Line caption={"Покупатель"}>
            <Line caption={"Наименование"}>
                <Input path={["buyer", "name"]}/>
            </Line>
            <Line caption={"GLN"}>
                <Input path={["buyer", "gln"]}/>
            </Line>
        </Line>
        <Line caption={"Товары"}>
            <Array path={["items"]}>
                <Line caption={"Наименование"}>
                    <Input path={["name"]}/>
                </Line>
                <Line caption={"GTIN"}>
                    <Input path={["gtin"]}/>
                </Line>
            </Array>
        </Line>
    </Form>
);
