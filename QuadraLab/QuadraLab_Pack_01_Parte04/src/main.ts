import "./styles/reset.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/responsive.css";
import { QuadraLabApp } from "./ui/QuadraLabApp";

const target = document.querySelector<HTMLDivElement>("#app");

if (!target) {
  throw new Error("Elemento #app não encontrado.");
}

const app = new QuadraLabApp(target);
app.start();
