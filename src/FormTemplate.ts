export type FormTemplate = {
    kind: "static",
    key: string;
    tags?: {
        [key: string]: any;
    };
    children: FormTemplate[]
} | {
    kind: "array",
    key: string,
    tags?: {
        [key: string]: any;
    };
    templates: FormTemplate[]
}

export type FormTemplateKind = FormTemplate['kind'];