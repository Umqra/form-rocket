import {Path} from "./core/Tree";

type Tags = {
    [key: string]: string[];
}

export interface FormTemplateControl {
    data(): {[key: string]: any};
    attach(update: (data: {[key: string]: any}) => void): void;
    reset(): void;
    update(update: {[key: string]: any}): void;
}

export function createControl(): FormTemplateControl {
    let attached: null | ((data: {[key: string]: any}) => void) = null;
    let data = {};
    return {
        data() {
            return data;
        },
        attach(update: (data: { [p: string]: any }) => void) {
            attached = update;
        },
        reset() {
            attached = null;
        },
        update(update: { [p: string]: any }) {
            data = update;
            if (attached != null) {
                attached(data);
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