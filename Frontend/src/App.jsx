import { useState } from "react";

function App() {
  const [input, setInput] = useState("");

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#00ff00",
        height: "100vh",
        padding: "2rem",
        fontFamily: "monospace",
      }}
    >
      <h2>[ LOCAL Llama 3.1 ORCHESTRATOR ]</h2>
      <hr style={{ borderColor: "#333" }} />

      <div style={{ height: "70vh", overflowY: "auto", marginBottom: "20px" }}>
        <p>{">"} System Initialized. Engine standing by...</p>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Awaiting command..."
        style={{
          width: "100%",
          backgroundColor: "#1a1a1a",
          color: "#00ff00",
          border: "1px solid #333",
          padding: "15px",
          fontFamily: "monospace",
          fontSize: "16px",
        }}
      />
    </div>
  );
}

export default App;
