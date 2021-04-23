import * as React from "react";
import {ButtonControl, Connect, FormContext, InputControl, LabelControl, LineControl, processReactTemplate, SectionControl} from "../src/core/FormControls";
import {$, Form, processTemplate} from "../src/core/FormState";
import {combine, forward, Store} from "effector";
import {ValidationContainer} from "@skbkontur/react-ui-validations";
import {ColumnStack} from "@skbkontur/react-stack-layout";

export default {
    title: "FormRocket2"
};

const SimpleFormTemplate = (
    <ColumnStack gap={2}>
        <SectionControl caption="Поставщик">
            <LineControl caption="Наименование">
                <InputControl path="supplier.name"/>
            </LineControl>
            <LineControl caption="Адрес">
                <InputControl path="supplier.address"/>
            </LineControl>
        </SectionControl>
        <SectionControl caption="Покупатель">
            <LineControl caption="Наименование">
                <InputControl path="buyer.name"/>
            </LineControl>
            <LineControl caption="Адрес">
                <InputControl path="buyer.address"/>
            </LineControl>
        </SectionControl>
        <ButtonControl viewId="validate">Валидировать</ButtonControl>
    </ColumnStack>
);

function configureValidations(form: Form) {
    function validateName(node: any) {
        forward({
            from: node.$value.map((x: string) => {
                if (x == null || x == "") {
                    return {type: "submit", level: "error", message: "Поле должно быть заполнено"};
                }
                if (x.length > 10) {
                    return {type: "submit", level: "error", message: "Название должно быть не длиннее чем 10 символов"};
                }
                return null;
            }),
            to: node.$validation
        });
    }
    function validateAddress(node: any) {
        forward({
            from: node.$value.map((x: string) => {
                if (x == null || x == "") {
                    return {type: "submit", level: "error", message: "Поле должно быть заполнено"};
                }
                return null;
            }),
            to: node.$validation
        });
    }
    validateName(form.data.buyer.name[$]);
    validateName(form.data.supplier.name[$]);
    validateAddress(form.data.buyer.address[$]);
    validateAddress(form.data.supplier.address[$]);
}

function configureActions(form: Form, container: ValidationContainer) {
    form.view.validate[$].activateFx.use(async () => {
        await container.validate();
    });
}

function configureVisibility(dataForm: Form, captionsForm: Form) {
    captionsForm.traverse<boolean>(captionsForm.view, (node, stores) => {
        const $visibility: Store<boolean> = stores.length == 0 ?
            node[$].$accessibility.map((x: any) => x !== "hidden") :
            combine(stores, visibility => visibility.some(x => x == true));
        forward({
            from: $visibility.map(x => !x ? "hidden" : undefined),
            to: node[$].$accessibility
        });
        return $visibility;
    });
    [dataForm.data.buyer.name, dataForm.data.buyer.address]
        .map(x => dataForm.findRelated(x))
        .flat()
        .map(x => dataForm.findMatchedParents(x, captionsForm.view))
        .flat()
        .map(x => x[$].accessibilityChanged("hidden"));

}

const {react, template} = processReactTemplate(SimpleFormTemplate);

export const SimpleForm = () => {
    const validationRef = React.useRef<ValidationContainer | null>();
    const [{dataForm}] = React.useState(() => {
        const dataForm = processTemplate(template);
        const captionsForm = dataForm.extract(x => x.caption != null)
        configureVisibility(dataForm, captionsForm);
        configureValidations(dataForm);
        return {dataForm, captionsForm};
    });
    React.useEffect(() => {
        configureActions(dataForm, validationRef.current);
    }, [validationRef.current]);
    return (
        <FormContext.Provider value={dataForm}>
            <ValidationContainer ref={validationRef}>
                {react}
            </ValidationContainer>
        </FormContext.Provider>
    );
}
