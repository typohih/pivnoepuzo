import { useState } from "react";
import { apiFetch } from "./api.js";
import { Main } from "./components/Main/Main.jsx";
import { Header } from "./components/Header/Header.jsx";
import { Footer } from "./components/Footer/Footer.jsx";
import "./App.css";

export function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [healthData, setHealthData] = useState(null);
  const [healthError, setHealthError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const response = await apiFetch("/api/health");

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        const payload = await response.json();

        if (isMounted) {
          setHealthData(payload);
          setHealthError("");
        }
      } catch (error) {
        if (isMounted) {
          setHealthError(
            error instanceof Error ? error.message : "Health check failed",
          );
        }
      }
    }

    checkHealth();

    return () => {
      isMounted = false;
    };
  }, []);

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
