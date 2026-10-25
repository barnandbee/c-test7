import { render } from "preact";
import "@fontsource-variable/oswald";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "./styles/tokens.css";
import "./styles/app.css";
import { App } from "./app";

render(<App />, document.getElementById("app")!);
