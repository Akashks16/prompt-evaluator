/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@11.1.1/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.8/+esm";
import logo from "./assets/logo.jpg";

// Change this to your actual Vercel deployment URL
const API_BASE_URL = window.location.origin;
const API_ENDPOINT = `${API_BASE_URL}/api/voicebot-evaluator`;
const EVALUATE_TARGET = "assistant";

const styles = {
  app: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    background: "#0f1419",
    color: "#f1f5f9",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(20, 28, 38, 0.8)",
    backdropFilter: "blur(12px)",
    flexShrink: 0,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
  },
  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "5px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#ffffff",
    boxShadow: "0 0 24px rgba(6, 182, 212, 0.5)",
  },
  headerTitle: {
    fontSize: "16px",
    margin: 0,
    color: "#ffffff",
  },
  headerSub: {
    fontSize: "12px",
    color: "#94a3b8",
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
    color: "#94a3b8",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 12px rgba(16, 185, 129, 0.7)",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "18px",
    background: "linear-gradient(180deg, #0f1419 0%, #1a1f29 100%)",
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
    lineHeight: "1.6",
    boxShadow: "0 4px 16px rgba(6, 182, 212, 0.3)",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
    textAlign: "left",
  },
  msgAssistant: {
    maxWidth: "78%",
    padding: "12px 16px",
    borderRadius: "12px",
    lineHeight: "1.6",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    alignSelf: "flex-start",
    background: "rgba(30, 41, 59, 0.6)",
    backdropFilter: "blur(8px)",
    color: "#f1f5f9",
    borderBottomLeftRadius: "4px",
    textAlign: "left",
    border: "1px solid rgba(148, 163, 184, 0.2)",
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
    color: "#ffffff",
  },
  metaTime: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  content: {
    fontSize: "14px",
    color: "#f1f5f9",
  },
  msgActions: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(20, 28, 38, 0.8)",
    backdropFilter: "blur(12px)",
    flexShrink: 0,
    boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.4)",
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
    background: "rgba(30, 41, 59, 0.6)",
    color: "#f1f5f9",
    border: "1.5px solid rgba(148, 163, 184, 0.2)",
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
    background: "rgba(51, 65, 85, 0.6)",
    color: "#cbd5e1",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "13px",
    transition: "all 0.2s",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 4px 16px rgba(6, 182, 212, 0.4)",
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
    background: "rgba(51, 65, 85, 0.6)",
    color: "#cbd5e1",
    border: "1px solid rgba(148, 163, 184, 0.2)",
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
    background: "#94a3b8",
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
    console.log("🔧 App initialized");
    console.log("🔧 API Endpoint:", API_ENDPOINT);
    console.log("🔧 Current URL:", window.location.href);
  }, []);

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

    console.log(
      "📤 [CLIENT] Sending message:",
      userMessage.text.substring(0, 50)
    );
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
      console.log("🌐 [CLIENT] Fetching:", API_ENDPOINT);
      console.log("🌐 [CLIENT] Method: POST");
      console.log("🌐 [CLIENT] Payload:", {
        evaluate_target: EVALUATE_TARGET,
        input_text_length: userMessage.text.length,
      });

      const fetchStart = Date.now();
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluate_target: EVALUATE_TARGET,
          input_text: userMessage.text,
        }),
      });

      const fetchDuration = Date.now() - fetchStart;
      console.log(`⏱️ [CLIENT] Fetch completed in ${fetchDuration}ms`);
      console.log(`📥 [CLIENT] Response status: ${res.status}`);
      console.log(`📥 [CLIENT] Response OK: ${res.ok}`);

      if (!res.ok) {
        const txt = await res.text();
        console.error("❌ [CLIENT] Error response:", txt);
        throw new Error(`Server error: ${res.status} — ${txt}`);
      }

      const contentType = res.headers.get("content-type") || "";
      console.log("📋 [CLIENT] Content-Type:", contentType);

      let body;

      if (contentType.includes("application/json")) {
        body = await res.json();
        console.log("✅ [CLIENT] Parsed JSON response");
      } else {
        const t = await res.text();
        console.log("📝 [CLIENT] Got text response, attempting JSON parse");
        try {
          body = JSON.parse(t);
        } catch (e: any) {
          console.log("⚠️ [CLIENT] Not JSON, using as plain text");
          body = { result: t };
        }
      }

      console.log("📦 [CLIENT] Response body keys:", Object.keys(body));

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
      console.log("✅ [CLIENT] Markdown length:", md.length);

      setMessages((prev: any) =>
        prev
          .filter((msg: any) => msg.id !== typingId)
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
      console.log("✅ [CLIENT] Message added to chat");
    } catch (err: any) {
      console.error("❌ [CLIENT] Error:", err);
      console.error("❌ [CLIENT] Error type:", err.constructor.name);
      console.error("❌ [CLIENT] Error message:", err.message);

      const errMsg = `An error occurred: ${err.message || String(err)}`;

      setMessages((prev: any) =>
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

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInputText("");
    console.log("🗑️ [CLIENT] Chat cleared");
  };

  const handleCopyLast = () => {
    const lastAssistant: any = [...messages]
      .reverse()
      .find((msg) => msg.who === "assistant" && !msg.isTyping);

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
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .typing-dot-1 { animation-delay: 0s; }
        .typing-dot-2 { animation-delay: 0.15s; }
        .typing-dot-3 { animation-delay: 0.3s; }
        pre {
          background: rgba(30, 41, 59, 0.8);
          padding: 12px;
          border-radius: 8px;
          overflow: auto;
          font-family: Menlo, monospace;
          font-size: 13px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #f1f5f9;
        }
        code {
          background: rgba(30, 41, 59, 0.6);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: Menlo, monospace;
          font-size: 13px;
          color: #67e8f9;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #ffffff;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        p {
          margin: 0.5em 0;
        }
        ul, ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        li {
          margin: 0.25em 0;
        }
        blockquote {
          border-left: 3px solid #06b6d4;
          padding-left: 1em;
          margin: 1em 0;
          color: #cbd5e1;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(71, 85, 105, 0.8);
          border-color: rgba(148, 163, 184, 0.3);
        }
        button.primary:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
          transform: translateY(-2px);
        }
        textarea:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
        }
        textarea::placeholder {
          color: #64748b;
        }
        a {
          color: #22d3ee;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.4);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.6);
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.8);
        }
      `}</style>

      <header style={styles.header}>
        <img style={styles.logo} src={logo} />
        <div>
          <h1 style={styles.headerTitle}>Kapture VoiceBot Evaluator</h1>
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
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                  {status}
                </div>
              )}
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className="primary"
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
