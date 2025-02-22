import React, { useState } from "react";
import axios from "axios";
import "../static/css/intel-crop-rec.css";

export default function IntelGovScheme() {
  const [commodity, setCommodity] = useState("");
  const [loading, setLoading] = useState(false);

  const [governmentData,setGovernmentData] = useState()
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const formData = {
      commodity,
    };

    try {
      // Send the data to the server
      const response = await axios.post(
        "http://localhost:5000/intel-gov-scheme",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from server:", response);
      const data = response.data;
    //   console.log(data)
      setGovernmentData(data.goverment_data);
      setLoading(false);
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
          {commodity && (
            <div className="crop-tag">
              {commodity}
            </div>
          )}
        </div>

        <input
          type="text"
          className="input-crop-list"
          value={commodity}
          list="crop_list"
          onChange={(e)=>setCommodity(e.target.value)}
          placeholder="Enter crop name"
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
           {loading && (
              <div className="loader-container">
              <div className="spinner"></div>
              <p>Processing...</p>
            </div>
          )}

          {/* Submit Button (Only Show When Not Loading) */}
          {!loading && (
            <div className="btn-block">
              <button id="predict_btn" className="submitbtn" type="submit">
                Submit
              </button>
            </div>
          )}
        </form>
      </div>
      {governmentData && (
        <>
          <div className="gov-scheme-section-header">
            <h2>Government Schemes</h2>
          </div>
          <div className="gov-scheme-guide-container">
            <ul className="gov-scheme-list">
              {governmentData.map((scheme, index) => (
                <SchemeBlock key={index} scheme={scheme} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}


// Reusable Scheme Block
const SchemeBlock = ({ scheme }) => (
    <li className="gov-scheme-block">
      <article>
        <h3>{scheme.scheme_name}</h3>
        <ul>
          {scheme.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
        <p>{scheme.purpose}</p>
      </article>
    </li>
  );