import {Path} from "./core/Tree";

type Tags = {
    [key: string]: string[];
}

export type FormTemplate = {
    kind: "view",
    viewKey: string;
    tags?: Tags;
    children: FormTemplate[]
} | {
    kind: "data-array",
    viewKey: string,
    dataPath: Path;
    tags?: Tags;
    templates: FormTemplate[]
} | {
    kind: "data-leaf",
    viewKey: string,
    dataPath: Path;
    tags?: Tags;
}

export type FormTemplateKind = FormTemplate['kind'];