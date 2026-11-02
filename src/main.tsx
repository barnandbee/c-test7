import { render } from "preact";
import "@fontsource-variable/oswald";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/components.css";
import { App } from "./app";

render(<App />, document.getElementById("app")!);

// Ask the browser not to clear this site's storage when space runs low.
navigator.storage?.persist?.().catch(() => {});
