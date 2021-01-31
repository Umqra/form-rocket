import {Path} from "./core/Tree";

type Tags = {
    [key: string]: string[];
}

export interface FormTemplateControl {
    data(key: any): {[key: string]: any};
    attach(key: any, update: (data: {[key: string]: any}) => void): void;
    update(key: any, update: {[key: string]: any}): void;
    reset(key: any): void;
}

type ControlData = {attached: null | ((data: {[key: string]: any}) => void), data: any}

export function createControl(): FormTemplateControl {
    const controls = new Map<any, ControlData>();
    return {
        data(key: any) {
            if (controls.has(key)) {
                return controls.get(key).data;
            }
            return {};
        },
        attach(key: any, update: (data: { [p: string]: any }) => void) {
            if (!controls.has(key)) {
                controls.set(key, {data: {}, attached: null});
            }
            controls.get(key).attached = update;
        },
        reset(key: any) {
            controls.delete(key);
        },
        update(key: any, update: { [p: string]: any }) {
            if (!controls.has(key)) {
                controls.set(key, {data: {}, attached: null});
            }
            const control = controls.get(key);
            control.data = update;
            if (control.attached != null) {
                control.attached(update);
            }
        }
    }
}

export type FormTemplate = {
    viewKey: string;
    control?: FormTemplateControl;
    tags?: Tags;
} & ({
    kind: "view",
    children: FormTemplate[]
} | {
    kind: "data-array",
    dataPath: Path;
    templates: FormTemplate[]
} | {
    kind: "data-leaf",
    dataPath: Path;
});

export type FormTemplateKind = FormTemplate['kind'];