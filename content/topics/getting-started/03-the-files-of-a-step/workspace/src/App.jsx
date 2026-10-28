import TipList from "./components/TipList.jsx";
import { tips } from "./tips.js";

export default function App() {
  return (
    <main>
      <h1>Tips for CS300 Practice</h1>
      <TipList tips={tips} />
    </main>
  );
}
