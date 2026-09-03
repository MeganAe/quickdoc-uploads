import { QueryClient } from "@tanstack/react-query";
import { createRouter, type RouterHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = (history?: RouterHistory) => {
  const queryClient = new QueryClient();

  const options = {
    routeTree,
    context: { queryClient },
    scrollRestoration: true as const,
    defaultPreloadStaleTime: 0,
    ...(history ? { history } : {}),
  };

  const router = createRouter(options);

  return router;
};
