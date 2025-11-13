/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@11.1.1/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.8/+esm";

const API_ENDPOINT = "/api/voicebot-evaluator";
const EVALUATE_TARGET = "assistant";

const styles = {
  app: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    background: "#f8fafc",
    color: "#1e293b",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "#ffffff",
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  headerTitle: {
    fontSize: "16px",
    margin: 0,
    color: "#0f172a",
  },
  headerSub: {
    fontSize: "12px",
    color: "#64748b",
    marginLeft: "6px",
  },
  headerInfo: {
    fontSize: "12px",
    color: "#64748b",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#64748b",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 6px rgba(16, 185, 129, 0.4)",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "18px",
  },
  messagesInner: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  msgUser: {
    maxWidth: "78%",
    padding: "12px 16px",
    borderRadius: "12px",
    lineHeight: "1.5",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    borderBottomRightRadius: "4px",
    textAlign: "left",
  },
  msgAssistant: {
    maxWidth: "78%",
    padding: "12px 16px",
    borderRadius: "12px",
    lineHeight: "1.5",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    alignSelf: "flex-start",
    background: "#ffffff",
    color: "#1e293b",
    borderBottomLeftRadius: "4px",
    textAlign: "left",
    border: "1px solid #e2e8f0",
  },
  meta: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  metaWho: {
    fontWeight: 600,
    fontSize: "13px",
  },
  metaTime: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  content: {
    fontSize: "14px",
  },
  msgActions: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    background: "#ffffff",
    flexShrink: 0,
    boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.05)",
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  textarea: {
    resize: "none",
    minHeight: "64px",
    maxHeight: "220px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  controls: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  leftControls: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  button: {
    background: "#ffffff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "13px",
    transition: "all 0.2s",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    transition: "all 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  smallBtn: {
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  typing: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    background: "#94a3af",
    borderRadius: "50%",
    animation: "blink 1.2s infinite",
  },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = () => {
    return new Date().toLocaleTimeString();
  };

  const handleSendMessage = async () => {
    if (isSending || !inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      who: "user",
      text: inputText.trim(),
      time: formatTime(),
      raw: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);
    setStatus("Sending…");

    const typingId = Date.now() + 1;
    setMessages((prev) => [
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

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error: ${res.status} — ${txt}`);
      }

      const contentType = res.headers.get("content-type") || "";
      let body;

      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        const t = await res.text();
        try {
          body = JSON.parse(t);
        } catch (e) {
          body = { result: t };
        }
      }

      let md = "";
      if (typeof body === "string") md = body;
      else if (body?.markdown) md = body.markdown;
      else if (body?.result) md = body.result;
      else if (body?.output) md = body.output;
      else if (body?.output_text) md = body.output_text;
      else if (body?.data) md = body.data;
      else if (body?.text) md = body.text;
      else {
        md = "```\n" + JSON.stringify(body, null, 2) + "\n```";
      }

      md = md.replace(/\\n/g, "\n");

      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== typingId)
          .concat({
            id: Date.now() + 2,
            who: "assistant",
            text: md,
            html: DOMPurify.sanitize(marked.parse(md || "")),
            time: formatTime(),
            raw: md,
          })
      );

      setStatus("Done");
    } catch (err: any) {
      console.error(err);
      const errMsg = `An error occurred: ${err.message || String(err)}`;

      setMessages((prev) =>
        prev
          .filter((msg: any) => msg.id !== typingId)
          .concat({
            id: Date.now() + 2,
            who: "assistant",
            text: errMsg,
            html: `<pre style="white-space:pre-wrap">${errMsg}</pre>`,
            time: formatTime(),
            raw: errMsg,
          })
      );

      setStatus("Error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInputText("");
  };

  const handleCopyLast = () => {
    const lastAssistant: any = [...messages]
      .reverse()
      .find((msg: any) => msg.who === "assistant" && !msg.isTyping);

    if (!lastAssistant) {
      alert("No assistant message to copy.");
      return;
    }

    navigator.clipboard
      ?.writeText(lastAssistant.raw || lastAssistant.text)
      .then(() => alert("Copied to clipboard"))
      .catch(() => alert("Copy failed"));
  };

  const handleCopyMessage = (msg: any) => {
    navigator.clipboard
      ?.writeText(msg.raw || msg.text)
      .then(() => {})
      .catch(() => alert("Copy failed"));
  };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .typing-dot-1 { animation-delay: 0s; }
        .typing-dot-2 { animation-delay: 0.15s; }
        .typing-dot-3 { animation-delay: 0.3s; }
        pre {
          background: #f1f5f9;
          padding: 12px;
          border-radius: 8px;
          overflow: auto;
          font-family: Menlo, monospace;
          font-size: 13px;
          border: 1px solid #e2e8f0;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.logo}>V</div>
        <div>
          <h1 style={styles.headerTitle}>
            VoiceBot Evaluator <span style={styles.headerSub}>— chat UI</span>
          </h1>
          <div style={styles.headerInfo}>
            Ask anything. Responses are rendered from Markdown.
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={styles.status}>
            <div style={styles.statusDot} />
            <div>Local API</div>
          </div>
        </div>
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
                  {msg.who === "user" ? "You" : "VoiceBot Evaluator"}
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
                    style={styles.content}
                    dangerouslySetInnerHTML={{
                      __html:
                        msg.html ||
                        msg.text.replace(/\n/g, "<br/>").replace(/</g, "&lt;"),
                    }}
                  />
                  <div style={styles.msgActions}>
                    <button
                      onClick={() => handleCopyMessage(msg)}
                      style={styles.smallBtn}
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
            placeholder="Type your message. Press Enter to send, Shift+Enter for newline..."
            style={styles.textarea}
          />
          <div style={styles.controls}>
            <div style={styles.leftControls}>
              <button onClick={handleClear} style={styles.button}>
                Clear
              </button>
              <button onClick={handleCopyLast} style={styles.button}>
                Copy last
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {status && (
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  {status}
                </div>
              )}
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                style={{
                  ...styles.buttonPrimary,
                  ...(isSending ? styles.buttonDisabled : {}),
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
