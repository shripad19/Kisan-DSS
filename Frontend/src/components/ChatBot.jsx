// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "../css/chatbot.css";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [listening, setListening] = useState(false);
//   const [detectedLanguage, setDetectedLanguage] = useState("en"); // Default language

//   // Speech recognition setup
//   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//   const recognition = SpeechRecognition ? new SpeechRecognition() : null;

//   if (recognition) {
//     recognition.continuous = false;
//     recognition.lang = "auto"; // Automatically detect language
//     recognition.interimResults = false;
//   }

//   // Handle voice input
//   const startListening = () => {
//     if (!recognition) {
//       alert("Speech recognition not supported in your browser.");
//       return;
//     }
//     setListening(true);
//     recognition.start();
//   };

//   // useEffect(() => {
//   //   if (recognition) {
//   //     recognition.onresult = async (event) => {
//   //       const transcript = event.results[0][0].transcript;
//   //       const detectedLang = await detectLanguage(transcript);
//   //       setDetectedLanguage(detectedLang);
//   //       const translatedText = await translateText(transcript, "en"); // Translate to English
//   //       setUserInput(translatedText);
//   //     };

//   //     recognition.onend = () => {
//   //       setListening(false);
//   //     };
//   //   }
//   // }, []);

//   // Detect language function
  
//   useEffect(() => {
//     if (recognition) {
//       recognition.onresult = async (event) => {
//         const transcript = event.results[0][0].transcript;
//         const detectedLang = await detectLanguage(transcript);
//         setDetectedLanguage(detectedLang);
//         const translatedText = await translateText(transcript, "en"); // Translate to English
  
//         setUserInput(translatedText);
  
//         // Auto-send the message after setting user input
//         setTimeout(() => {
//           sendMessage({ preventDefault: () => {} }); // Simulate form submission
//         }, 500); // Short delay to ensure state update
//       };
  
//       recognition.onend = () => {
//         setListening(false);
//       };
//     }
//   }, []); 
  
  
//   const detectLanguage = async (text) => {
//     try {
//       const response = await axios.post("http://localhost:4000/detect-language", { text });
//       return response.data.language;
//     } catch (error) {
//       console.error("Error detecting language:", error);
//       return "en"; // Default to English
//     }
//   };

//   // Translate text function
//   const translateText = async (text, targetLang) => {
//     try {
//       const response = await axios.post("http://localhost:4000/translate", { text, targetLang });
//       return response.data.translatedText;
//     } catch (error) {
//       console.error("Error translating text:", error);
//       return text;
//     }
//   };

//   // Text-to-Speech function
//   const speak = (text, lang) => {
//     if (window.speechSynthesis.speaking) {
//       window.speechSynthesis.cancel();
//       return;
//     }

//     const speech = new SpeechSynthesisUtterance(text);
//     speech.lang = lang;
//     speech.rate = 1;
//     speech.pitch = 1;

//     window.speechSynthesis.speak(speech);
//   };

//   // Handle text message submission
//   const sendMessage = async (event) => {
//     event.preventDefault();
//     if (!userInput.trim()) return;

//     const newMessages = [...messages, { text: userInput, sender: "user" }];
//     setMessages(newMessages);
//     setUserInput("");

//     try {
//       // Send translated input (English) to backend
//       const response = await axios.post("http://localhost:4000/chat", { userInput });
//       let botMessage = response.data.response;

//       // Translate bot response back to user's language
//       const translatedResponse = await translateText(botMessage, detectedLanguage);

//       setMessages([...newMessages, { text: translatedResponse, sender: "bot" }]);
//     } catch (error) {
//       console.error("Error:", error);
//       setMessages([...newMessages, { text: "Error retrieving response.", sender: "bot" }]);
//     }
//   };

//   return (
//     <div className="chat-container">
//       <h1>AgriBot</h1>
//       <div className="chat-history">
//         {messages.map((msg, index) => (
//           <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
//             <span>{msg.text}</span>
//             {msg.sender === "bot" && (
//               <button className="speak-btn" onClick={() => speak(msg.text, detectedLanguage)}>
//                 🔊
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={sendMessage} className="chat-form">
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="Ask AgriBot..."
//         />
//         <button type="submit">Send</button>
//         <button type="button" className="voice-btn" onClick={startListening}>
//           🎤 {listening ? "Listening..." : "Voice"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;



import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/chatbot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [listening, setListening] = useState(false);

  // Speech recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
  }

  // Handle voice input
  const startListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in your browser.");
      return;
    }
    setListening(true);
    recognition.start();
  };

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
      };

      recognition.onend = () => {
        setListening(false);
      };
    }
  }, []);

  // Text-to-Speech function

  const speak = (text) => {
    if (window.speechSynthesis.speaking) {
      // Stop speech if already speaking
      window.speechSynthesis.cancel();
      return;
    }
  
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    
    window.speechSynthesis.speak(speech);
  };
  
  // Handle text message submission

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!userInput.trim()) return;
  
    const newMessages = [...messages, { text: userInput, sender: "user" }];
    setMessages(newMessages);
    setUserInput("");
  
    try {
      const response = await axios.post("http://localhost:4000/chat", { userInput });
      let botMessage = response.data.response;
  
      // Format the bot's response to support bold text using HTML
      botMessage = botMessage
        .replace(/\\(.?)\\/g, "<strong>$1</strong>") // Convert **bold* to <strong>bold</strong>
        .replace(/\n/g, "<br />"); // Convert new lines to <br>
  
      setMessages([...newMessages, { text: botMessage, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { text: "Error retrieving response.", sender: "bot" }]);
    }
  };
  

  
  return (
    <div className="chat-container">
      <h1>AgriBot</h1>
      <div className="chat-history">
        {messages.map((msg, index) => (

<div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
  {msg.sender === "bot" && (
    <button className="speak-btn" onClick={() => speak(msg.text)}>🔊</button>
  )}
</div>


        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask AgriBot..."
        />
        <button type="submit">Send</button>
        <button type="button" className="voice-btn" onClick={startListening}>
          🎤 {listening ? "Listening..." : "Voice"}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;