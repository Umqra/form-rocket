import * as React from "react";
import {Form} from "./controls/Form";
import {Many, Input, Label, Line} from "./TemplateControls";
import {ColumnStack, RowStack} from "@skbkontur/react-stack-layout";

export const MessageTemplate = (
    <Form>
        <Line caption={"Номер заказа (для чтения)"}>
            <Label path={["orderNumber"]}/>
        </Line>
        <Line caption={"Номер заказа"}>
            <Input path={["orderNumber"]}/>
        </Line>
        <Line caption={"Поставщик"}>
            <ColumnStack>
                <Line caption={"Наименование"}>
                    <Input path={["supplier", "name"]}/>
                </Line>
                <Line caption={"GLN"}>
                    <Input path={["supplier", "gln"]}/>
                </Line>
            </ColumnStack>
        </Line>
        <Line caption={"Покупатель"}>
            <ColumnStack>
                <Line caption={"Наименование"}>
                    <Input path={["buyer", "name"]}/>
                </Line>
                <Line caption={"GLN"}>
                    <Input path={["buyer", "gln"]}/>
                </Line>
            </ColumnStack>
        </Line>
        <Line caption={"Товары"}>
            <Many path={["items"]}>
                <RowStack>
                    <Input path={["name"]}/>
                    <Input path={["gtin"]}/>
                </RowStack>
            </Many>
        </Line>
    </Form>
);
