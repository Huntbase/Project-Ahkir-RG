import React, { useState } from "react";
import axios from "axios";

function TranslateComponent() {
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = async () => {
    if (!textToTranslate) {
      alert("Please enter text to translate");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/translate", {
        text: textToTranslate,
      });
      if (res.data.translatedText) {
        setTranslatedText(res.data.translatedText);
        setIsTranslated(true);
      }
    } catch (error) {
      console.error("Error translating:", error);
      alert("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTranslatedText("");
    setIsTranslated(false);
  };

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#e0e0e0",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2 style={{ color: "#333", marginBottom: "15px" }}>
        Indonesian to English Translation
      </h2>
      <div style={{ display: "flex", marginBottom: "10px" }}>
        <textarea
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
          placeholder="Enter Indonesian text to translate..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginRight: "10px",
            minHeight: "80px",
          }}
        />
        <button
          onClick={handleTranslate}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1E90FF",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            alignSelf: "center",
            fontWeight: "bold",
          }}
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      </div>

      {translatedText && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "15px",
          }}
        >
          <h3
            style={{
              color: "#9CA3AF",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          >
            English Translation:
          </h3>
          <p
            style={{
              color: "black",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {translatedText}
          </p>
        </div>
      )}
    </div>
  );
}

export default TranslateComponent;
