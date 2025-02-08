type PGError = {
    message: string;
    columnName: string;
    type: "dup";
};

// TODO: tests and this should be extended and also used in more places
export default function postgresErrorHandler(error: Error & { code: string }): PGError {
    switch (error.code) {
        case "23505":
            const column = error.message.split(" ").at(-1)?.split('_')[1]!;
            return { message: `Duplicate entry ${column}`, type: "dup", columnName: column };
    }
    throw error;
}
