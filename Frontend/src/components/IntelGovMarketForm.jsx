import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../static/css/intel_gov_market_form.css";

export default function IntelGovMarketForm({setGovMarketForm}) {
  const [commodity, setCommodity] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!commodity || !year || !month) {
      setError("Please fill all the fields before submitting.");
      return;
    }

    const formData = { commodity, year, month };

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/intel-wpi-price", formData, {
        headers: { "Content-Type": "application/json" },
      });
      const responseData = response.data;
      navigate("/intel-gov-market-price", { state: responseData });
      setSuccess("Data submitted successfully!");
    } catch (err) {
      setError("Failed to send data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intel-price-form-root">
      <div className="intel-price-form-container">
        <header className="intel-price-form-header">
        Intel Market Insights <i className="intel-form-header-subtitle"><strong> &ndash; Sell for Profit</strong></i>
          </header>
        <div className="intel-price-main-form">
          <form className="intel-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Commodity</label>
              <select
                className="form-select"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
              >
                <option value="">Select Commodity</option>
                {["Bajra", "Barley", "Cotton", "Gram", "Groundnut", "Jowar", "Maize", "Masoor", "Moong", "Soyabean", "Sugarcane", "Tur", "Urad", "Wheat"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-control"
                placeholder="2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {["1 - January", "2 - February", "3 - March", "4 - April", "5 - May", "6 - June", "7 - July", "8 - August", "9 - September", "10 - October", "11 - November", "12 - December"].map((item, index) => (
                  <option key={index + 1} value={index + 1}>{item}</option>
                ))}
              </select>
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="mb-4 intel-form-btn-block">
              {loading && (<div className="intel-gov-market-form-loader-div"></div>)}
              {!loading && (
                <>
              <button type="submit" className="btn btn-success">
                Submit
              </button>
               <button onClick={()=>setGovMarketForm(false)} className="close-form-price-prediction">Close</button>
               </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
