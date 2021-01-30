import {intersect} from "./SetUtils";

test("intersection", () => {
    expect(intersect(new Set([1, 2, 3]), new Set([2, 4, 1]))).toEqual(new Set([1, 2]));
});

test("empty intersection", () => {
    expect(intersect(new Set([1, 2, 3]), new Set([4, 5, 6]))).toEqual(new Set());
});

test("string set intersection", () => {
   expect(intersect(new Set(["a", "bb", "c"]), new Set(["aa", "b", "c"]))).toEqual(new Set(["c"]));
});

test("one set contained in another", () => {
    expect(intersect(new Set([1, 2, 3, 4]), new Set([2, 3]))).toEqual(new Set([2, 3]));
    expect(intersect(new Set([2, 3]), new Set([1, 2, 3, 4]))).toEqual(new Set([2, 3]));
})