import { publishQuizSchema } from "@repo/api/public-schemas";
import type { ServerWebSocket } from "bun";
import type { JWTPayload } from "hono/utils/jwt/types";
import type { LobbyUser as lob } from "repo";
import { z } from "zod";
import { quizAnswerSchema } from "./schemas/zodschemas";

export type QuizzyJWTPAYLOAD = {
    userId: string;
    refreshTokenId: number;
    exp: number;
} & JWTPayload;

export type LobbyUser = {
    lobbyUserData: Partial<lob> & {
        userId: string;
        stats: {
            placement?: number;
            correctAnswerCount: number;
            wrongAnswerCount: number;
            score: number;
        };
        pongTimeout: Timer;
    };
};

export type LobbyMap = Map<string, Lobby>;

export type Lobby = {
    members: Set<ServerWebSocket<LobbyUser>>;
    quizData?: z.infer<typeof publishQuizSchema> & { quiz: { id: string } };
    gameState:
        | {
              hostId: string;
              started: false;
          }
        | {
              hostId: string;
              started: true;
              // we will jumble the questions before sending them with an iterator
              // one by one
              questionIndices: Iterator<number>;
              currentQuestionIndex?: number;
              currentRoundAnswers: Map<
                  string,
                  z.infer<typeof quizAnswerSchema>
              >;
              // handle round ending with a timeout and a cb
              roundEndTimeout?: Timer;
              roundEndTrigger?: () => void;
          };
};
