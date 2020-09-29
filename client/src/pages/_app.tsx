import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { cacheExchange, Cache, QueryInput } from "@urql/exchange-graphcache";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  LoginMutation,
  LogoutMutation,
  RegisterMutation,
} from "../generated/graphql";
import theme from "../theme";

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
function MyApp({ Component, pageProps }) {
  const client = createClient({
    url: "http://localhost:8000/graphql",
    fetchOptions: { credentials: "include" },
    exchanges: [
      dedupExchange,
      cacheExchange({
        updates: {
          Mutation: {
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, CurrentUserQuery>(
                cache,
                { query: CurrentUserDocument },
                _result,
                () => ({ currentUser: null })
              );
            },
          },
        },
      }),
      fetchExchange,
    ],
  });

  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
