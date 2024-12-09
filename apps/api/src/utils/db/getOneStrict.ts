export default function getOneStrict<T>(QueryResult: T[]): T {
    if (QueryResult.length === 0 || QueryResult.length > 1) {
        throw new Error("Multiple or no users found on a query where getOneStrict is used!");
    }

    return QueryResult[0];
}
