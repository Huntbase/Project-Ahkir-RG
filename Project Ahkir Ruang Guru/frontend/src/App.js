import React, { useState } from "react";
import axios from "axios";
import TranslateComponent from "./TranslateComponent";

function App() {
  const [activeTab, setActiveTab] = useState("Ask.Io");
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const [power, setPower] = useState("");
  const [quantity, setQuantity] = useState("");
  const [duration, setDuration] = useState("");
  const [electricityUsage, setElectricityUsage] = useState(null);
  const [history, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [fileResponse, setFileResponse] = useState(""); // State untuk menyimpan respon dari upload file

  const tabs = ["Ask.Io", "Summary", "Calculator", "Translation"];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Chat Function
  const handleUpload = async () => {
    if (!file || !prompt.trim()) {
      alert("Please select a file and enter a prompt.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", prompt);

    try {
      const res = await axios.post("http://localhost:8080/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFileResponse(res.data.answer); // Menyimpan respon dari file upload

      // Add the question and answer to chat history
      setChatHistory((prev) => [
        ...prev,
        { question: prompt, answer: res.data.answer },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload and analyze file");
    }
  };

  // File Upload Function
  const handleChat = async () => {
    if (!query.trim()) {
      alert("Please enter a question.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/chat", { query });
      setResponse(res.data.answer);

      // Add the question and answer to chat history
      setChatHistory((prev) => [
        ...prev,
        { question: query, answer: res.data.answer },
      ]);
    } catch (error) {
      console.error("Error querying chat:", error);
      alert("Failed to get response");
    }
  };

  const calculateElectricityUsage = () => {
    if (!power || !quantity || !duration) {
      alert("Please fill in all fields for electricity calculation.");
      return;
    }

    const totalUsage =
      (parseFloat(power) * parseInt(quantity) * parseFloat(duration)) / 1000;
    setElectricityUsage(totalUsage);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1499428665502-503f6c608263?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
          textAlign: "center",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Title */}
        <h1
          style={{
            color: "#ffffff",
            marginBottom: "20px",
            animation: "glow 1.5s infinite",
            fontWeight: "bold",
          }}
        >
          Ask.Io Chatbot
        </h1>
        <style>
          {`
    @keyframes glow {
      0% { text-shadow: 0 0 5px #1E90FF, 0 0 10px #1E90FF; }
      50% { text-shadow: 0 0 20px #1E90FF, 0 0 30px #1E90FF; }
      100% { text-shadow: 0 0 5px #1E90FF, 0 0 10px #1E90FF; }
    }
  `}
        </style>
        <nav
          style={{
            display: "flex",
            padding: "10px",
            background: "#f5f5f5",
            borderRadius: "5px",
            marginBottom: "20px",
            justifyContent: "center",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                margin: "0 10px",
                backgroundColor: activeTab === tab ? "#1E90FF" : "transparent",
                color: activeTab === tab ? "#fff" : "#333",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
        {/* Tab Content */}
        {activeTab === "Ask.Io" && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#e0e0e0",
              boxShadow: "0 4px 8px rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 style={{ color: "#333", marginBottom: "15px" }}>Ask.Io</h2>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask question here..."
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              />
              <button
                onClick={handleChat}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E90FF",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Chat
              </button>
            </div>

            {response && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                }}
              >
                <h4>Response</h4>
                <p>{response}</p>
              </div>
            )}
          </div>
        )}

        {/* File Upload Section */}
        {/* Tab Content */}
        {activeTab === "Summary" && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#e0e0e0",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h2 style={{ color: "#333", marginBottom: "15px" }}>File Upload</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                style={{
                  flex: "1",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a question about the file..."
                style={{
                  flex: "2",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button
                onClick={handleUpload}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E90FF",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Upload and Analyze
              </button>
            </div>
            {fileResponse && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                }}
              >
                <h4>File Response</h4>
                <p>{fileResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Translation Component */}
        {activeTab === "Translation" && (
          <div style={{ marginTop: "20px" }}>
            <TranslateComponent />
          </div>
        )}

        {/* Calculator Section */}
        {activeTab === "Calculator" && (
          <div
            style={{
              margin: "10px  0",
              padding: "20px",
              backgroundColor: "#e0e0e0",
              borderRadius: "12px",
              boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>
              Electricity Usage Calculator
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              <input
                type="number"
                value={power}
                onChange={(e) => setPower(e.target.value)}
                placeholder="Power (Watt)"
                style={{
                  padding: "12px",
                  border: "2px solid #1E90FF",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  fontSize: "16px",
                }}
              />
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                style={{
                  padding: "12px",
                  border: "2px solid #1E90FF",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  fontSize: "16px",
                }}
              />
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (hours/day)"
                style={{
                  padding: "12px",
                  border: "2px solid #1E90FF",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  fontSize: "16px",
                }}
              />
              <button
                onClick={calculateElectricityUsage}
                style={{
                  padding: "12px",
                  backgroundColor: "#1E90FF",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Calculate
              </button>
            </div>
            {electricityUsage !== null && (
              <div
                style={{
                  marginTop: "20px",
                  backgroundColor: "#2D3748",
                  padding: "20px",
                  borderRadius: "8px",
                }}
              >
                <h3 style={{ marginBottom: "10px" }}>Total Usage</h3>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#38BDF8",
                  }}
                >
                  {electricityUsage.toFixed(2)} kWh/day
                </p>
              </div>
            )}
          </div>
        )}
        {/* Chat History Section */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h4 style={{ margin: 0 }}>Chat History</h4>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                border: "none",
                backgroundColor: "transparent",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              {showHistory ? "▼ Hide" : "▲ Show"}
            </button>
          </div>

          {showHistory && (
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              {history.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>
                  No history available
                </p>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      backgroundColor: "#fff",
                      textAlign: "left",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Q:</strong> {item.question}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>A:</strong> {item.answer}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
