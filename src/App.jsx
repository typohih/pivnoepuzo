import { useState } from "react";
import { Main } from "./components/Main/Main.jsx";
import { Header } from "./components/Header/Header.jsx";
import { Footer } from "./components/Footer/Footer.jsx";
import "./App.css";

export function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="app">
      <div className="app__shell">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Main searchQuery={searchQuery} />
        <Footer />
      </div>
    </div>
  );
}
