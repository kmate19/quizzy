import sharp from "sharp";

export async function makeSharpImage(pfpBuf: Buffer) {
    return await sharp(pfpBuf)
        .resize(400, 300, { fit: sharp.fit.inside })
        .avif()
        .toBuffer();
}

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// eslint-disable-next-line
export function tryCatch<Args extends any[], Output, E extends Error>(
    fn: (...args: Args) => Output,
    ...args: Args
): Result<Output, E | Error> {
    try {
        return { ok: true, value: fn(...args) };
    } catch (e) {
        if (e instanceof Error) {
            return { ok: false, error: e as E };
        }
        console.error("TRYCATCH UNKNOWN ERROR: ", e);
        return { ok: false, error: new Error("Unknown error") };
    }
}

export async function tryCatchAsync<
    // eslint-disable-next-line
    Args extends any[],
    Output,
    E extends Error,
>(
    fn: (...args: Args) => Promise<Output>,
    ...args: Args
): Promise<Result<Output, E | Error>> {
    try {
        return { ok: true, value: await fn(...args) };
    } catch (e) {
        if (e instanceof Error) {
            return { ok: false, error: e as E };
        }
        console.error("TRYCATCH UNKNOWN ERROR: ", e);
        return { ok: false, error: new Error("Unknown error") };
    }
}

export function tryCatchClosure<Output, E extends Error>(
    fn: () => Output
): Result<Output, E | Error> {
    try {
        return { ok: true, value: fn() };
    } catch (e) {
        if (e instanceof Error) {
            return { ok: false, error: e as E };
        }
        console.error("TRYCATCH UNKNOWN ERROR: ", e);
        return { ok: false, error: new Error("Unknown error") };
    }
}

export async function tryCatchAsyncClosure<Output, E extends Error>(
    fn: () => Promise<Output>
): Promise<Result<Output, E | Error>> {
    try {
        return { ok: true, value: await fn() };
    } catch (e) {
        if (e instanceof Error) {
            return { ok: false, error: e as E };
        }
        console.error("TRYCATCH UNKNOWN ERROR: ", e);
        return { ok: false, error: new Error("Unknown error") };
    }
}
