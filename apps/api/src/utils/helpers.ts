import { createCanvas, loadImage } from "canvas";

export async function processImage(
    pfpBuf: Buffer,
    width?: number,
    height?: number
) {
    const w = width || 400;
    const h = height || 300;
    const canvas = createCanvas(w, h);

    const ctx = canvas.getContext("2d");

    const image = await loadImage(pfpBuf);

    ctx.drawImage(image, 0, 0, w, h);

    return canvas.toBuffer("image/jpeg", { quality: 1.0 });
}

export async function makeDefaultPfp(name: string) {
    const canvas = createCanvas(300, 300);

    const ctx = canvas.getContext("2d");

    const gradientCombinations = [
        // Deep purple to navy
        ["#2C3E50", "#4A235A", "#1A2639"],

        // Forest green to deep teal
        ["#1E3A2B", "#2C7873", "#0F252D"],

        // Burgundy to deep blue
        ["#4A1942", "#2E294E", "#1B1B1E"],

        // Dark teal to midnight blue
        ["#2C3531", "#116466", "#0B2545"],

        // Slate blue to deep purple
        ["#2B303A", "#3C415C", "#301934"],
    ];

    const randomIndex = Math.floor(Math.random() * gradientCombinations.length);
    const selectedGradient = gradientCombinations[randomIndex];

    const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );

    gradient.addColorStop(0, selectedGradient[0]);
    gradient.addColorStop(0.5, selectedGradient[1]);
    gradient.addColorStop(1, selectedGradient[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const intial = name.charAt(0).toUpperCase();

    ctx.font = "bold 120px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(intial, canvas.width / 2, canvas.height / 2);

    return canvas.toBuffer("image/jpeg", { quality: 1.0 });
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
