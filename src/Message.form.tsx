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

let x: Message;
export const MessageTemplate = (
    <Form>
        <Line caption={"Номер заказа"}>
            <Input path={() => x.orderNumber}/>
        </Line>
        <Line caption={"Поставщик"}>
            <Line caption={"Наименование"}>
                <Input path={() => x.supplier.name}/>
            </Line>
            <Line caption={"GLN"}>
                <Input path={() => x.supplier.gln}/>
            </Line>
        </Line>
        <Line caption={"Покупатель"}>
            <Line caption={"Наименование"}>
                <Input path={() => x.buyer.name}/>
            </Line>
            <Line caption={"GLN"}>
                <Input path={() => x.buyer.gln}/>
            </Line>
        </Line>
        <Line caption={"Товары"}>
            <Array path={() => x.goodItems}
        </Line>
    </Form>
);
