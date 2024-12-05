type PGError = {
    message: string;
    columnName: string;
    type: "dup";
};

export default function postgresErrorHandler(error: Error & { code: string }): PGError {
    switch (error.code) {
        case "23505":
            const column = error.message.split(" ").at(-1)?.split('_')[1]!;
            return { message: `Duplicate entry ${column}`, type: "dup", columnName: column };
    }
    throw error;
}
