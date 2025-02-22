import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../static/css/intel_gov_market_form.css";

export default function IntelLocalMarketForm({ setLocalMarketForm }) {
  const [commodity, setCommodity] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [srcDistrict, setSrcDistrict] = useState("");
  const [srcSubdistrict, setSrcSubdistrict] = useState("");
  const [desDistrict, setDesDistrict] = useState("");
  const [milage, setMilage] = useState("");
  const [subdistrictOptions, setSubdistrictOptions] = useState([]);
  const [cropyield, setCropYield] = useState("");

  const districtSubdistricts = {
    Kolhapur: [
      "Panhala",
      "Shahuwadi",
      "Shirol",
      "Hatkanangle",
      "Karveer",
      "Gaganbavda",
      "Radhanagari",
      "Kagal",
      "Bhudargad",
      "Ajra",
      "Gadhinglaj",
      "Chandgad",
    ],
    Pune: [
      "Ambegaon",
      "Baramati",
      "Bhor",
      "Daund",
      "Haveli",
      "Indapur",
      "Junnar",
      "Khed",
      "Maval",
      "Mulshi",
      "Purandar",
      "Shirur",
      "Velhe",
    ],
    Sangli: [
      "Miraj",
      "Palus",
      "Tasgaon",
      "Kavathemahankal",
      "Jat",
      "Khanapur",
      "Atpadi",
      "Walwa",
      "Kadegaon",
      "Shirala",
    ],
    Satara: [
      "Satara",
      "Karad",
      "Wai",
      "Koregaon",
      "Jaoli",
      "Mahabaleshwar",
      "Khandala",
      "Patan",
      "Phaltan",
      "Khatav",
      "Maan",
    ],
    Solapur: [
      "Akkalkot",
      "Barshi",
      "Karmala",
      "Madha",
      "Malshiras",
      "Mangalwedha",
      "Mohol",
      "Pandharpur",
      "Sangole",
      "North Solapur",
      "South Solapur",
    ],
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setSrcDistrict(selectedDistrict);

    // Update subdistrict options based on the selected district
    if (selectedDistrict) {
      setSubdistrictOptions(districtSubdistricts[selectedDistrict]);
    } else {
      setSubdistrictOptions([]); // Clear subdistrict options if no district is selected
    }

    // Reset subdistrict selection
    setSrcSubdistrict("");
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !commodity ||
      !year ||
      !month ||
      !srcDistrict ||
      !srcSubdistrict ||
      !desDistrict ||
      !milage
    ) {
      setError("Please fill all the fields before submitting.");
      return;
    }

    const formData = {
      commodity,
      year,
      month,
      srcDistrict,
      srcSubdistrict,
      desDistrict,
      milage,
      cropyield,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/intel-market-price",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const responseData = response.data;
      // console.log(responseData)
      navigate("/intel-gov-market-dashboard", { state: responseData });
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
          Intel Market Guide{" "}
          <i className="intel-form-header-subtitle">
            {" "}
            <strong>&ndash; Maximize Your Profit</strong>
          </i>
        </header>
        <div className="intel-price-main-form">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Commodity</label>
              <select
                className="form-select"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
              >
                <option value="">Select Commodity</option>
                {[
                  "Bajra",
                  "Barley",
                  "Cotton",
                  "Gram",
                  "Groundnut",
                  "Jowar",
                  "Maize",
                  "Masoor",
                  "Moong",
                  "Soyabean",
                  "Sugarcane",
                  "Tur",
                  "Urad",
                  "Wheat",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="formcontent-group">
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
              <div className="mb-3">
                <label className="form-label">Month</label>
                <select
                  className="form-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {[
                    "1 - January",
                    "2 - February",
                    "3 - March",
                    "4 - April",
                    "5 - May",
                    "6 - June",
                    "7 - July",
                    "8 - August",
                    "9 - September",
                    "10 - October",
                    "11 - November",
                    "12 - December",
                  ].map((item, index) => (
                    <option key={index + 1} value={index + 1}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="formcontent-group">
              <div className="mb-3">
                <label className="form-label">Your District</label>
                <select
                  className="form-select"
                  value={srcDistrict}
                  onChange={handleDistrictChange}
                >
                  <option value="">Select Source District</option>
                  {Object.keys(districtSubdistricts).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Your Sub District</label>
                <select
                  className="form-select"
                  value={srcSubdistrict}
                  onChange={(e) => setSrcSubdistrict(e.target.value)}
                  disabled={!srcDistrict}
                >
                  <option value="">Select Sub District</option>
                  {subdistrictOptions.map((subdistrict) => (
                    <option key={subdistrict} value={subdistrict}>
                      {subdistrict}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="formcontent-group">

              <div className="mb-3">
                <label className="form-label">Crop Yield (Quintal) </label>
                <input
                  type="number"
                  step="2"
                  className="form-control"
                  value={cropyield}
                  placeholder="Enter crop yield in quintal"
                  onChange={(e) => setCropYield(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Market District</label>
                <select
                  className="form-select"
                  value={desDistrict}
                  onChange={(e) => setDesDistrict(e.target.value)}
                >
                  <option value="">Select Market District</option>
                  {Object.keys(districtSubdistricts).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">
                Milage of transportation Vehical
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="15.4"
                value={milage}
                onChange={(e) => setMilage(e.target.value)}
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="mb-4 intel-form-btn-block">
              {loading && (
                <div className="intel-gov-market-form-loader-div"></div>
              )}
              {!loading && (
                <>
                  <button type="submit" className="btn btn-success">
                    Submit
                  </button>
                  <button
                    onClick={() => setLocalMarketForm(false)}
                    className="close-form-price-prediction"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
