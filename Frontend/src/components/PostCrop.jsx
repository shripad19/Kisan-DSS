import React, { useState, useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.css';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Alert, { AlertSuccess } from "./Alert";
import "../css/PostCrop.css";

const PostCrop = () => {
  const [cropname, setCropname] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [quantity, setQuantity] = useState("");
  const [organic, setOrganic] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  const [status, setStatus] = useState("");

  const [farmerId, setFarmerId] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFarmerId(decoded.userId);
        setEmail(decoded.email);
        setState(decoded.state);
        setDistrict(decoded.district);
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      navigate("/login/farmer");
    }
  }, [navigate]);

  const [preview, setPreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setPreview(reader.result);
      };
    }
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    const cropData = {
      farmerId,
      email,
      state,
      district,
      cropname,
      description,
      category,
      price_per_kg: pricePerKg,
      quantity,
      unit: "kg",
      organic,
      image: imageBase64,
    };

    try {
      const response = await fetch("http://localhost:4000/postcrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cropData),
      });

      const data = await response.json();
      setStatus(data.status);
      if (data.status === "ok") {
        setTimeout(() => navigate("/home-farmer"), 3000);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div className="farmer-post-crop-container">
      <h2 className="farmer-post-crop-title">Submit Crop Details</h2>
      {status === "ok" && <AlertSuccess />}

      <form onSubmit={onHandleSubmit} className="farmer-post-crop-form">
        <div className="farmer-form-group">
          <label className="farmer-form-label">Email</label>
          <input value={email} type="email" className="farmer-form-control" readOnly />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">District</label>
          <input value={district} type="text" className="farmer-form-control" readOnly />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">State</label>
          <input value={state} type="text" className="farmer-form-control" readOnly />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">Crop Name</label>
          <input
            value={cropname}
            onChange={(e) => setCropname(e.target.value)}
            type="text"
            className="farmer-form-control"
            placeholder="Enter crop name"
            required
          />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            className="farmer-form-control"
            placeholder="Enter Description"
            required
          />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="farmer-form-control"
            required
          >
            <option value="">Select Category</option>
            <option value="Cereals">Cereals</option>
            <option value="Pulses">Pulses</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Oilseeds">Oilseeds</option>
            <option value="Spices">Spices</option>
            <option value="Beverage Crops">Beverage Crops</option>
          </select>
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">Price per Kg</label>
          <input
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
            type="number"
            className="farmer-form-control"
            placeholder="Enter price per Kg"
            required
          />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">Quantity (Kg)</label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            className="farmer-form-control"
            placeholder="Enter quantity available"
            required
          />
        </div>

        <div className="farmer-form-group farmer-organic-checkbox">
          <label className="farmer-form-label">Organic</label>
          <input
            type="checkbox"
            checked={organic}
            onChange={(e) => setOrganic(e.target.checked)}
          />
        </div>

        <div className="farmer-form-group">
          <label className="farmer-form-label">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Crop Preview" className="farmer-image-preview" />}
        </div>

        <button type="submit" className="farmer-submit-button">Submit</button>
      </form>
    </div>
  );
};

export default PostCrop;