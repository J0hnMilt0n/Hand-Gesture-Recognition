import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Volume2, Trash2 } from "lucide-react";

function App() {
  const webcamRef = useRef(null);
  const [gestureChar, setGestureChar] = useState("");
  const [sentence, setSentence] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [gestureImg, setGestureImg] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // 📸 Capture and predict gesture
  const captureAndPredict = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      const response = await axios.post(
        "http://localhost:8000/predict", // Make sure this matches the backend URL
        formData
      );
      const data = response.data;

      // Update the gesture prediction result in the frontend
      setGestureChar(data.prediction); // Update with the predicted gesture class
    } catch (error) {
      console.error("Prediction error:", error);
    }
  };

  // 🔁 Prediction loop
  useEffect(() => {
    const interval = setInterval(captureAndPredict, 1000);
    return () => clearInterval(interval);
  }, []);

  const speakSentence = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  const clearSentence = () => {
    setSentence("");
    setGestureChar("");
    setSuggestions([]);
    setGestureImg("");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <header className="text-center text-4xl font-bold mb-8">
        Sign Language to Text & Speech
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 📷 Webcam View */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg w-full aspect-video"
            audio={false}
          />
          <p className="text-center mt-2 text-sm text-gray-500">
            Real-Time Sign Detection
          </p>
        </div>

        {/* 🖼️ Gesture Image */}
        <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
          {gestureImg ? (
            <img
              src={gestureImg}
              alt="Gesture"
              className="rounded-lg w-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center aspect-video">
              <span className="text-gray-500">Gesture Landmark View</span>
            </div>
          )}
          <p className="text-center mt-2 text-sm text-gray-500">
            Hand Landmark Detection
          </p>
        </div>

        {/* 📊 Prediction Output */}
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-6">
          {/* Character */}
          <div>
            <p className="text-gray-600 font-mono">Character:</p>
            <p className="text-3xl font-bold">{gestureChar}</p>
          </div>

          {/* Sentence */}
          <div>
            <p className="text-gray-600 font-mono">Sentence:</p>
            <p className="text-xl font-bold break-words min-h-[3rem]">
              {sentence}
            </p>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-red-600 font-bold">Suggestions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((word, idx) => (
                <button
                  key={idx}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm hover:bg-gray-100"
                  onClick={() => setSentence(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={clearSentence}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-400 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
            <button
              onClick={speakSentence}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              <Volume2 className="w-4 h-4" /> Speak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
