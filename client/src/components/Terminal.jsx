import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api/agent.js";
import "./Terminal.css";

export function Terminal() {
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "system",
      text: "System initialized. Engine standing by...",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const logEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          text: reply || "[No content returned]",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "error",
          text: `[ERROR] ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <header className="terminal-header">
        <div className="terminal-title">
          <span className="status-dot"></span>
          <h1>[ LOCAL AGENT ORCHESTRATOR ]</h1>
        </div>
        <span className="model-badge">llama3.1</span>
      </header>

      <main id="terminal-log" className="terminal-log">
        {messages.map((msg) => (
          <div key={msg.id} className={`terminal-line line-${msg.role}`}>
            {msg.role === "user" && <span className="line-prefix">&gt; </span>}
            {msg.role === "agent" && <span className="line-prefix">agent: </span>}
            {msg.role === "system" && <span className="line-prefix"># </span>}
            <span className="line-text">{msg.text}</span>
          </div>
        ))}

        {isLoading && (
          <div className="terminal-line line-loading">
            <span className="line-prefix">agent: </span>
            <span className="thinking-text">Thinking</span>
            <span className="blinking-cursor">_</span>
          </div>
        )}
        <div ref={logEndRef} />
      </main>

      <form className="terminal-input-bar" onSubmit={handleSubmit}>
        <span className="input-prompt">&gt;</span>
        <input
          id="terminal-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Awaiting agent execution..." : "Awaiting command..."}
          disabled={isLoading}
          autoComplete="off"
          spellCheck="false"
        />
        <button id="terminal-submit" type="submit" disabled={isLoading || !input.trim()}>
          RUN
        </button>
      </form>
    </div>
  );
}
