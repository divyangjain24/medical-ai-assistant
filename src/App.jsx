import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const OPENROUTER_API_KEY = "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";

const App = () => {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [medicine, setMedicine] = useState("");
  const [medInfo, setMedInfo] = useState("");
  const toastRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("chatHistory"));
    if (history) setChat(history);
    setChat((prev) => [
      ...prev,
      { sender: "bot", text: "👨‍⚕️ Hello! I'm Dr. AI. How can I assist you today?" },
    ]);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendToAI = async (messages) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    };

    const body = {
      model: "openai/gpt-3.5-turbo",
      messages,
    };

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.error(err);
      return "⚠️ Failed to fetch response.";
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const newChat = [...chat, { sender: "user", text: message }];
    setChat(newChat);
    setMessage("");

    const messages = [
      { role: "system", content: "You are an AI doctor chatbot that helps users with medical issues." },
      ...newChat.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
    ];

    const reply = await sendToAI(messages);
    setChat([...newChat, { sender: "bot", text: reply }]);
  };

  const fetchPlan = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const prompt = `You are a professional AI Medical Assistant. A patient has this condition: "${input}". Give a structured personalized treatment plan in the format:
1. Condition Overview
2. Symptoms
3. Recommended Tests
4. Treatment Plan
5. Diet & Lifestyle Advice
6. When to See a Doctor`;

    const messages = [{ role: "user", content: prompt }];
    const reply = await sendToAI(messages);
    setPlan(reply);
    setLoading(false);
  };

  const fetchMedicineInfo = async () => {
    if (!medicine.trim()) return;
    setMedInfo("Loading...");

    const prompt = `Provide detailed information about the medicine "${medicine}". Include:
- Generic Name
- Uses
- Dosage
- Side Effects
- Precautions
- When to consult a doctor`;

    const messages = [{ role: "user", content: prompt }];
    const reply = await sendToAI(messages);
    setMedInfo(reply);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleSpeech = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setInput(speech);
    };
    recognition.start();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toastRef.current.style.display = "block";
    setTimeout(() => {
      toastRef.current.style.display = "none";
    }, 2000);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="container">
        {/* Sidebar Chatbot */}
        <div className="sidebar">
          <h2>AI Doctor Chat</h2>
          <div className="chatbox">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>

        {/* Main Features */}
        <div className="main">
          <header>
            <h1>Medical AI Assistant</h1>
            <button className="toggle-mode-btn" onClick={toggleDarkMode}>
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </header>

          {/* Treatment Plan */}
          <div className="card">
            <h3>🔎 Get Medical Treatment Plan</h3>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. migraine, diabetes..."
            />
            <div className="button-group">
              <button onClick={handleSpeech}>🎤</button>
              <button onClick={fetchPlan}>{loading ? "Loading..." : "Get Plan"}</button>
            </div>
          </div>

          {plan && (
            <div className="card">
              <h3>📋 Treatment Plan</h3>
              <pre>{plan}</pre>
              <button onClick={() => handleCopy(plan)}>📋 Copy</button>
            </div>
          )}

          {/* Medicine Info Checker */}
          <div className="card">
            <h3>💊 Medicine Info Checker</h3>
            <input
              type="text"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              placeholder="e.g. Paracetamol"
            />
            <button onClick={fetchMedicineInfo}>Check Medicine</button>
          </div>

          {medInfo && (
            <div className="card">
              <h3>📄 Medicine Details</h3>
              <pre>{medInfo}</pre>
              <button onClick={() => handleCopy(medInfo)}>📋 Copy</button>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>📞 Phone: <a href="tel:8630062115">8630062115</a></p>
        <p>📸 Instagram: <a href="https://instagram.com/__morningstar7854" target="_blank" rel="noopener noreferrer">@__morningstar7854</a></p>
      </footer>

      <div id="toast" ref={toastRef}>✅ Copied to clipboard!</div>
    </div>
  );
};

export default App;
