import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../static/css/intel-crop-rec.css";

export default function IntelCropRec() {
  const [input, setInput] = useState(""); 
  const [crops, setCrops] = useState([]); 
  const [year, setYear] = useState(""); 
  const [month, setMonth] = useState(""); 
  const [district, setDistrict] = useState(""); 
  const [area, setArea] = useState(""); 
  const [fertilizer, setFertilizer] = useState(""); 
  const [nitrogen, setNitrogen] = useState(""); 
  const [phosphorus, setPhosphorus] = useState(""); 
  const [potassium, setPotassium] = useState("");
  const [pH, setPH] = useState("");
  const [soilColor, setSoilColor] = useState("");

  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInput(e.target.value); 
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      setCrops((prevCrops) => [...prevCrops, input.trim()]);
      setInput("");
    }
  };

  const handleDeleteCrop = (index) => {
    setCrops(crops.filter((crop, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      crops,
      year,
      month,
      district,
      area,
      fertilizer,
      nitrogen,
      phosphorus,
      potassium,
      pH,
      soilColor,
    };

    try {
      // Send the data to the server
      const response = await axios.post(
        "http://localhost:5000/intel-crop-recommendation",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from server:", response.data);
      const data = response.data;
      console.log(data)
      setLoading(false);
      navigate('/intel-crop-rec-result',{state:data})
      // Handle the response from the server if necessary
    } catch (error) {
      console.error("Error sending data to the server:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="intel-crop-rec-root">
      <nav className="intel-price-nav">
        <div className="intel-header-logotext">
          Intel Crop Rec &ndash; <i>Sow for profit</i>
        </div>
        <div className="intel-header-content">
          <a href="/farmer-dashboard">Home</a>
          <a href="#">Kisan Guide</a>
          <a href="#">Help</a>
          <a href="">Contact</a>
        </div>
      </nav>
      <div className="input-crop-list-block">
        <div className="crop-tags">
          {crops.map((crop, index) => (
            <div key={index} className="crop-tag">
              {crop}
              <button
                onClick={() => handleDeleteCrop(index)}
                className="delete-btn"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <input
          type="text"
          className="input-crop-list"
          value={input}
          list="crop_list"
          onChange={handleInputChange}
          onKeyDown={handleKeyPress} // Listen for Enter key press
          placeholder="Enter crop name and press Enter"
        />
        <datalist id="crop_list">
          <option value="Jowar">Jowar</option>
          <option value="Bajra">Bajra</option>
          <option value="Sugarcane">Sugarcane</option>
          <option value="Maize">Maize</option>
          <option value="Cotton">Cotton</option>
        </datalist>
      </div>
      <div className="main-crop-rec-form_block">
        <form onSubmit={handleSubmit}>
          <div className="sub-yield-form-block">
            <div className="yield-formcontent">
              <label htmlFor="year">Year : </label>
              <input
                className="intel-price-input"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Enter year"
                min="1"
              />
            </div>

            <div className="yield-formcontent">
              <label htmlFor="month">Select Month : </label>
              <select
                className="intel-price-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                <option value="1">1 - January</option>
                <option value="2">2 - February</option>
                <option value="3">3 - March</option>
                <option value="4">4 - April</option>
                <option value="5">5 - May</option>
                <option value="6">6 - June</option>
                <option value="7">7 - July</option>
                <option value="8">8 - August</option>
                <option value="9">9 - September</option>
                <option value="10">10 - October</option>
                <option value="11">11 - November</option>
                <option value="12">12 - December</option>
              </select>
            </div>

            <div className="yield-formcontent">
              <label htmlFor="district">Select District : </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">Select District</option>
                <option value="Kolhapur">Kolhapur</option>
                <option value="Pune">Pune</option>
                <option value="Sangli">Sangli</option>
                <option value="Satara">Satara</option>
                <option value="Solapur">Solapur</option>
              </select>
            </div>
            <div className="yield-formcontent">
              <label htmlFor="area">Cultivation Area : </label>
              <input
                className="intel-price-input"
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter Area in hectare"
                min="0"
                 step="0.01"
              />
            </div>
            <div className="yield-formcontent">
              <label htmlFor="soilColor">Soil Color:</label>
              <select
                id="soilColor"
                name="soilColor"
                className="intel-price-input"
                value={soilColor}
                onChange={(e) => setSoilColor(e.target.value)}
              >
                <option value="">Select Soil Color</option>
                <option value="Medium Brown">Medium Brown</option>
                <option value="Black">Black</option>
                <option value="Dark Brown">Dark Brown</option>
                <option value="Red">Red</option>
                <option value="Reddish Brown">Reddish Brown</option>
                <option value="Light Brown">Light Brown</option>
              </select>
            </div>
            <div className="yield-formcontent">
              <label htmlFor="fertilizer">Select Fertilizer :</label>
              <select
                id="fertilizer"
                name="fertilizer"
                value={fertilizer}
                onChange={(e) => setFertilizer(e.target.value)}
              >
                <option value="">Select Fertilizer</option>
                <option value="Urea">Urea</option>
                <option value="10:26:26 NPK">10:26:26 NPK</option>
                <option value="Dark Brown">Dark Brown</option>
                <option value="SSP">SSP</option>
                <option value="MOP">MOP</option>
                <option value="18:46:00 NPK">18:46:00 NPK</option>
                <option value="Chilated Micronutrient">
                  Chilated Micronutrient
                </option>
                <option value="DAP">DAP</option>
                <option value="Black">Black</option>
                <option value="12:32:16 NPK">12:32:16 NPK</option>
                <option value="20:20:20 NPK">20:20:20 NPK</option>
              </select>
            </div>

            <div className="yield-formcontent">
              <label htmlFor="Nitrogen">Nitrogen : </label>
              <input
                className="intel-price-input"
                type="number"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                placeholder="Enter Nitrogen"
                min="0"
                 step="0.01"
              />
            </div>
            <div className="yield-formcontent">
              <label htmlFor="Phosphorus">Phosphorus : </label>
              <input
                className="intel-price-input"
                type="number"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                placeholder="Enter Phosphorus"
                min="0"
                 step="0.01"
              />
            </div>
            <div className="yield-formcontent">
              <label htmlFor="Potassium">Potassium : </label>
              <input
                className="intel-price-input"
                type="number"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                placeholder="Enter Potassium"
                min="0"
                 step="0.01"
              />
            </div>
            <div className="yield-formcontent">
              <label htmlFor="pH">pH : </label>
              <input
                name="pH"
                className="intel-price-input"
                type="number"
                placeholder="Enter pH"
                min="0"
                step="0.01"
                value={pH}
                onChange={(e) => setPH(e.target.value)}
              />
            </div>
          </div>
          
           {loading && (
              <div className="loader-container-crop-rec">
              <div className="spinner"></div>
              <p>Processing...</p>
            </div>
          )} 
          {!loading && (
            <div className="btn-block">
              <button id="predict_btn" className="submitbtn" type="submit">
                Submit
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
