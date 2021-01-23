import {createEngine, FormDataTree, NodeId} from "./FormDataTree";

interface FormTemplateStructure {
    tags: {
        [key: string]: string
    }
    children: FormTemplateStructure[]
}

type Path = string[];
type FormSubscription<TData> = (previousData: TData, currentData: TData, changes: Path[]) => void;

export interface Form<TData> {
    engine: FormDataTree;
    subscribe(subscription: FormSubscription<TData>): () => void;
}

function createForm<TData>(initial: TData, template: FormTemplateStructure): Form<TData> {
    const engine = createEngine();

    return {
        engine: engine
    };
}
