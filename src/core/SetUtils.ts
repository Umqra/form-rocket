export function intersect<T>(a: Set<T>, b: Set<T>): Set<T> {
    if (a.size > b.size) {
        return intersect(b, a);
    }
    const result = new Set<T>();
    a.forEach(x => {
        if (b.has(x)) {
            result.add(x);
        }
    });
    return result;
}
