import {Path} from "./Tree";

export function pathToString(path: Path): string {
    return path.join(".");
}

export function pathFromString(pathString: string): Path {
    return pathString == '' ? [] : pathString.split(".");
}