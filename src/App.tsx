/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@11.1.1/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.8/+esm";
import logo from "./assets/logo.jpg";

const API_BASE_URL = window.location.origin;
const API_ENDPOINT = `${API_BASE_URL}/api/voicebot-evaluator`;
const EVALUATE_TARGET = "assistant";

const styles = {
  app: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    background: "#f7f7f8",
    fontFamily: '"Inter", sans-serif',
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 24px",
    background: "#fff",
    borderBottom: "1px solid #e6e6e6",
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  logo: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#444",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
    color: "#111",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    background: "#f0f2f5",
  },
  messagesInner: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  msgUser: {
    maxWidth: "70%",
    padding: "12px 16px",
    borderRadius: "16px",
    lineHeight: "1.5",
    wordWrap: "break-word",
    whiteSpace: "normal",
    alignSelf: "flex-end",
    background: "#303030",
    color: "white",
    fontSize: "14px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
  },
  msgAssistant: {
    maxWidth: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    lineHeight: "1.5",
    wordWrap: "break-word",
    whiteSpace: "normal",
    alignSelf: "flex-start",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  meta: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "6px",
  },
  metaWho: {
    fontWeight: 600,
    fontSize: "12px",
    color: "#444",
  },
  metaTime: {
    fontSize: "11px",
    color: "#888",
  },
  content: {
    fontSize: "14px",
    color: "#111",
  },
  userContent: {
    fontSize: "14px",
    color: "white",
  },
  footer: {
    padding: "12px 20px",
    borderTop: "1px solid #e6e6e6",
    background: "#fff",
    flexShrink: 0,
    boxShadow: "0 -1px 3px rgba(0,0,0,0.05)",
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  textarea: {
    resize: "none",
    minHeight: "60px",
    maxHeight: "200px",
    padding: "12px 16px",
    borderRadius: "8px",
    background: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    background: "#f0f0f0",
    color: "#111",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    marginRight: "10px",
    transition: "background 0.2s",
  },
  buttonPrimary: {
    background: "#0b5ed7",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  typing: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    background: "#888",
    borderRadius: "50%",
    animation: "blink 1.2s infinite",
  },
};

function App() {
  const [messages, setMessages] = useState<any>([]);
  const [inputText, setInputText] = useState<any>("");
  const [isSending, setIsSending] = useState<any>(false);
  const [status, setStatus] = useState<any>("");
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    console.log("App initialized", API_ENDPOINT);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSendMessage = async () => {
    if (isSending || !inputText.trim()) return;
    const userMessage = {
      id: Date.now(),
      who: "user",
      text: inputText.trim(),
      time: formatTime(),
      raw: inputText.trim(),
    };
    setMessages((prev: any) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);
    setStatus("Sending…");

    const typingId = Date.now() + 1;
    setMessages((prev: any) => [
      ...prev,
      { id: typingId, who: "assistant", isTyping: true, time: formatTime() },
    ]);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluate_target: EVALUATE_TARGET,
          input_text: userMessage.text,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      let body;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) body = await res.json();
      else body = { result: await res.text() };

      let md =
        body?.output_text || body?.result || JSON.stringify(body, null, 2);

      // Collapse multiple newlines to single
      md = md.replace(/\n{2,}/g, "\n").trim();

      setMessages((prev: any) =>
        prev
          .filter((msg: any) => msg.id !== typingId)
          .concat({
            id: Date.now() + 2,
            who: "assistant",
            text: md,
            html: DOMPurify.sanitize(marked.parse(md)),
            time: formatTime(),
            raw: md,
          })
      );

      setStatus("");
    } catch (err: any) {
      const errMsg = `Error: ${err.message || String(err)}`;
      setMessages((prev: any) =>
        prev
          .filter((msg: any) => msg.id !== typingId)
          .concat({
            id: Date.now() + 2,
            who: "assistant",
            text: errMsg,
            html: `<pre>${errMsg}</pre>`,
            time: formatTime(),
            raw: errMsg,
          })
      );
      setStatus("Error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleClear = () => setMessages([]);
  const handleCopyLast = () => {
    const last = [...messages]
      .reverse()
      .find((m) => m.who === "assistant" && !m.isTyping);
    if (!last) return alert("No assistant message to copy.");
    navigator.clipboard
      .writeText(last.raw || last.text)
      .then(() => alert("Copied!"));
  };
  const handleCopyMessage = (msg: any) =>
    navigator.clipboard.writeText(msg.raw || msg.text);

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:0.4;}50%{opacity:1;} }
        .typing-dot-1 { animation-delay:0s; }
        .typing-dot-2 { animation-delay:0.15s; }
        .typing-dot-3 { animation-delay:0.3s; }
        pre { background:#f5f5f5; padding:8px 12px; border-radius:6px; font-family:Menlo, monospace; font-size:13px; color:#111; overflow-x:auto; }
        code { background:#eee; padding:2px 6px; border-radius:4px; font-family:Menlo, monospace; font-size:13px; color:#d6336c; }
      `}</style>

      <header style={styles.header}>
        <img style={styles.logo} src={logo} alt="Logo" />
        <h1 style={styles.headerTitle}>VoiceBot Evaluator</h1>
      </header>

      <main style={styles.messagesContainer}>
        <div style={styles.messagesInner}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={msg.who === "user" ? styles.msgUser : styles.msgAssistant}
            >
              <div style={styles.meta}>
                <div style={styles.metaWho}>
                  {msg.who === "user" ? "You" : "Evaluator"}
                </div>
                <div style={styles.metaTime}>{msg.time}</div>
              </div>
              {msg.isTyping ? (
                <div style={styles.typing}>
                  <span style={styles.typingDot} className="typing-dot-1" />
                  <span style={styles.typingDot} className="typing-dot-2" />
                  <span style={styles.typingDot} className="typing-dot-3" />
                </div>
              ) : (
                <>
                  <div
                    style={
                      msg?.who === "user" ? styles.userContent : styles.content
                    }
                    dangerouslySetInnerHTML={{
                      __html: msg.html || msg.text?.replaceAll("\n", ",<br>"),
                    }}
                  />
                  <div style={{ marginTop: "6px" }}>
                    <button
                      style={styles.button}
                      onClick={() => handleCopyMessage(msg)}
                    >
                      Copy
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.inputArea}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={styles.textarea}
          />
          <div style={styles.controls}>
            <div>
              <button style={styles.button} onClick={handleClear}>
                Clear
              </button>
              <button style={styles.button} onClick={handleCopyLast}>
                Copy last
              </button>
            </div>
            <button
              style={{
                ...styles.buttonPrimary,
                ...(isSending ? styles.buttonDisabled : {}),
              }}
              onClick={handleSendMessage}
              disabled={isSending}
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
