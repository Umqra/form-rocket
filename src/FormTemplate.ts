import {createEngine, FormDataTree} from "./FormDataTree";

export type FormTemplate = {
    key: string;
    tags: {
        [key: string]: string;
    };
    children: FormTemplate
} | {
    key: string,
    tags: {
        [key: string]: string;
    };
    childrenTemplate: FormTemplate
}

type Path = string[];
type FormSubscription = (path: Path[], value: any) => void;

export interface Form {
    tree: FormDataTree;
    update(path: Path[], value: any): void;
    subscribe(subscription: FormSubscription): () => void;
}

function createForm(template: FormTemplate): Form {
    const engine = createEngine();

    return {
        engine: engine
    };
}
