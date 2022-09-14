// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { commentRouter } from "./comment-router";
import { exampleRouter } from "./example";
import { postRouter } from "./post-router";
import { protectedExampleRouter } from "./protected-example-router";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter)
  .merge("post.", postRouter)
  .merge("comment.", commentRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
