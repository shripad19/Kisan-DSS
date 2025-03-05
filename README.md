# 🌾 Kisan-DSS (Decision Support System)  

## 🚀 Empowering Farmers with Real-Time Market Intelligence & Direct Market Access  

Kisan DSS is an advanced **Agritech** platform designed to **empower farmers** by providing:  
✅ **Real-time market insights**  
✅ **Intelligent crop & market recommendations**  
✅ **Direct access to buyers & e-commerce marketplace**  

Our system integrates **AI, machine learning, and e-commerce functionalities** to revolutionize agriculture.

---

## 📌 Features  

### 1️⃣ Real-time APMC Market Prices  
📊 Fetches **real-time** APMC market prices from official sources.  
💰 Helps farmers **maximize profits** by selling at the best price.  

### 2️⃣ Intelligent Market Recommendation  
🧠 AI-driven **market analysis** suggests the best locations to sell crops.  
📈 Predicts **future price trends** based on **historical data**.  

### 3️⃣ Smart Decision Building  
📡 Uses **weather, soil, and demand data** to assist in crop-selling decisions.  
📍 Recommends the best **markets** for farmers based on **profitability & transport costs**.  

### 4️⃣ Intelligent Crop Recommendation  
🌱 Suggests **optimal crops** for a farmer based on **soil type, climate, and market demand**.  
📊 Helps in **crop diversification** for **higher revenue**.  

### 5️⃣ E-Commerce Marketplace  
🛒 Farmers can **list crops for sale** directly to buyers.  
🤝 Enables **direct transactions** between farmers & consumers without intermediaries.  

### 6️⃣ Multilingual Dashboard & AI Chatbot  
💬 **AI-powered chatbot** (AgriBot) answers farmer queries in **multiple languages**.  
🎤 **Voice-enabled interactions** for accessibility.  

---

## 🏗️ Tech Stack  

### **🔹 Backend (Flask & Node.js)**
- **Flask** (Python) for AI-based recommendations  
- **Node.js & Express** for API handling and user management  
- **MongoDB** for storing user, crop, and market data  

### **🔹 Frontend (React.js)**
- **React.js** for an interactive farmer dashboard  
- **Bootstrap & CSS** for responsive UI  

### **🔹 AI & Machine Learning**
- **Gemini AI API** for chatbot interactions  
- **Pre-trained ML models** for market prediction  
- **NLP & Text-to-Speech (TTS)** for multilingual support  

---

## 📂 Folder Structure  

```bash
Kisan-DSS/
│── Backend-Flask/
│   ├── pip_requirements_backend.txt
│   ├── models/
│   │   ├── MarketPrice/
│   │   │   ├── model.pkl
│   │   │   ├── preprocessor.pkl
│   │   ├── Rainfall/
│   │   │   ├── model.pkl
│   │   │   ├── preprocessor.pkl
│   │   ├── WPI/
│   │   │   ├── model.pkl
│   │   │   ├── preprocessor.pkl
│   ├── .env
│   ├── app.py
│
│── Backend-Node/
│   ├── node_requirements_backend.txt
│   ├── models/
│   │   ├── crop.js
│   │   ├── farmer.js
│   │   ├── user.js
│   ├── .env
│   ├── server.js
│
│── Frontend/
│   ├── node_requirements_frontend.txt
│   ├── public/
│   │   ├── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── css/
│   │   ├── static/
│   │   │   ├── css/
│   │   │   ├── CropImages/
│   │   ├── app.js
│   │   ├── index.js
```


## 🏗️ Installation & Setup  

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/shripad19/Kisan-DSS.git
cd Kisan-DSS
```
2️⃣ **Backend (Flask)  Setup**
```bash
cd Backend-Flask
pip install -r pip_requirements_backend.txt
python app.py
```
3️⃣ **Backend (Node.js) Setup**
```bash
cd Backend-Node
npm install
node server.js
```
4️⃣ **Frontend (React.js) Setup**
```bash
cd Frontend
npm install
npm start
```
