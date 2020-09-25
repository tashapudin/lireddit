import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { Provider, createClient } from "urql";
import theme from "../theme";

function MyApp({ Component, pageProps }) {
  const client = createClient({
    url: "http://localhost:8000/graphql",
    fetchOptions: { credentials: "include" },
  });
  console.log("");

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
