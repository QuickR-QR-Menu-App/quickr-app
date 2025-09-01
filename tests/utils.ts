export function checkNotNull<T>(data: T | null | undefined, msg?: string) {
    if (data === null || data === undefined) {
        throw new Error(msg ?? "Null was not expected here.");
    }
    return data;
}