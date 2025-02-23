const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { Translate } = require("@google-cloud/translate").v2;


const farmerscoll = require("./models/farmer");
const userscoll = require("./models/user");
const cropcolls = require("./models/crop");

dotenv.config();
const secretKey = process.env.JWT_SECRET || "your_secret_key";

const app = express();
app.use(express.json({ limit: "50mb" })); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const nodemailer = require("nodemailer");

const port = 4000;

mongoose.connect("mongodb://localhost:27017/farmCommerce")
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Database connection error:", err));

app.get("/", (req, res) => {
    res.send("This is server");
});

// Farmer Signup
app.post("/signup-farmer", async (req, res) => {
    try {
        const { name, email, state, district, phone, password } = req.body;

        let user = await farmerscoll.findOne({ email });
        if (user) return res.status(400).json({ message: "Farmer already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new farmerscoll({ name, email, password: hashedPassword, phone, state, district });
        await user.save();

        res.status(201).json({ message: "Farmer Signup successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Farmer Login
app.post("/login-farmer", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await farmerscoll.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, state: user.state, phone: user.phone, district: user.district, coins: user.coins },
            secretKey,
            { expiresIn: "1h" }
        );

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// User Signup
app.post("/signup-user", async (req, res) => {
    try {
        const { name, email, phone, Apartment, district, state, pincode, password } = req.body;

        // Check if user already exists
        let user = await userscoll.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with correct schema structure
        user = new userscoll({
            name,
            email,
            password: hashedPassword,
            phone,
            address: {
                Apartment,   // Correctly stored under `address`
                district,
                state,
                pincode
            },
            cart: [], // Initialize cart as empty array
            order_history: [] // Initialize order history as empty array
        });

        // Save user to DB
        await user.save();

        res.status(201).json({ message: "User signup successful" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// User Login
app.post("/login-user", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userscoll.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, state: user.state, phone: user.phone, district: user.district, coins: user.coins },
            secretKey,
            { expiresIn: "1h" }
        );

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate Random 6-Digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Request OTP
app.post("/request-otp", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userscoll.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate OTP & Store in DB
        let otp = generateOTP();
        user.otp = otp;
        await user.save();

        // Send OTP via Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Login",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "OTP sent successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
});

// Verify OTP
// app.post("/verify-otp", async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         const user = await userscoll.findOne({ email });
//         if (!user || user.otp !== otp) {
//             return res.status(400).json({ message: "Invalid OTP" });
//         }

//         // Clear OTP after successful login
//         user.otp = null;
//         await user.save();

//         // Generate JWT Token
//         const token = jwt.sign(
//             { userId: user._id, name: user.name, email: user.email, state: user.state, phone: user.phone, district: user.district, coins: user.coins  },
//             secretKey,
//             { expiresIn: "1h" }
//         );

//         res.json({ message: "Login successful", token, user });

//     } catch (err) {
//         res.status(500).json({ message: "Error verifying OTP", error: err.message });
//     }
// });

app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await userscoll.findOne({ email });
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Clear OTP after successful login
        user.otp = null;
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            secretKey,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token, user });

    } catch (err) {
        res.status(500).json({ message: "Error verifying OTP", error: err.message });
    }
});


app.post("/request-otp-farmer", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await farmerscoll.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate OTP & Store in DB
        let otp = generateOTP();
        user.otp = otp;
        await user.save();

        // Send OTP via Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Login",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "OTP sent successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
});

// Step 2: Verify OTP
// app.post("/verify-otp-farmer", async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         const user = await farmerscoll.findOne({ email });
//         if (!user || user.otp !== otp) {
//             return res.status(400).json({ message: "Invalid OTP" });
//         }

//         // Clear OTP after successful login
//         user.otp = null;
//         await user.save();

//         // Generate JWT Token
//         const token = jwt.sign(
//             { userId: user._id, name: user.name, email: user.email, state: user.state, phone: user.phone, district: user.district, coins: user.coins  },
//             secretKey,
//             { expiresIn: "1h" }
//         );

//         res.json({ message: "Login successful", token, user });

//     } catch (err) {
//         res.status(500).json({ message: "Error verifying OTP", error: err.message });
//     }
// });

app.post("/verify-otp-farmer", async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await farmerscoll.findOne({ email });
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Clear OTP after successful login
        user.otp = null;
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name, email: user.email, state: user.state, phone: user.phone, district: user.district, coins: user.coins },
            secretKey,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token, user });

    } catch (err) {
        res.status(500).json({ message: "Error verifying OTP", error: err.message });
    }
});

app.get("/farmer-profile", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const farmer = await farmerscoll.findOne({ email });
        if (!farmer) return res.status(404).json({ error: "Farmer not found" });

        res.json(farmer);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Post Crop (Base64 Image Storage)
app.post("/postcrop", async (req, res) => {
    try {
        const { farmerId, email, state, district, cropname, description, category, price_per_kg, quantity, organic, image } = req.body;

        console.log(farmerId);
        const farmer = await farmerscoll.findById(farmerId);
        if (!farmer) {
            return res.status(400).json({ status: "error", message: "Invalid farmerId, farmer does not exist" });
        }


        if (!image) {
            return res.status(400).json({ status: "error", message: "Image is required" });
        }

        const newCrop = new cropcolls({
            farmerId,
            email,
            state,
            district,
            cropname,
            description,
            category,
            price_per_kg,
            quantity,
            unit: "kg",
            organic,
            imageBase64: image, // Store image as Base64
        });

        await newCrop.save();
        res.status(200).json({ status: "ok", message: "Crop posted successfully" });
    } catch (error) {
        console.error("Error saving crop:", error);
        res.status(500).json({ status: "error", message: "Error saving crop" });
    }
});

// Retrieve Image (Base64)
app.get("/image/:id", async (req, res) => {
    try {
        const crop = await cropcolls.findById(req.params.id);
        if (!crop) return res.status(404).json({ message: "Crop not found" });

        res.json({ image: crop.imageBase64 });
    } catch (error) {
        console.error("Error retrieving image:", error);
        res.status(500).json({ message: "Error retrieving image" });
    }
});




app.get("/active-crops", async (req, res) => {
    try {
        console.log("Active crops request arrived");
        const { email } = req.query; // Extract email from query params

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Fetch crops where email matches and quantity > 0
        const crops = await cropcolls.find(
            { email: email, quantity: { $gt: 0 } },
            { cropname: 1, price_per_kg: 1, quantity: 1, imageBase64: 1, earnings: 1, "rating.average": 1 } // Select only required fields
        );

        console.log("Fetched Crops:", crops);
        res.json(crops); // Directly send the crops with Base64 image
    } catch (error) {
        console.error("Error fetching active crops:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/delete-crop/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting crop with ID:", id);

        const deletedCrop = await cropcolls.findByIdAndDelete(id);

        if (!deletedCrop) {
            return res.status(404).json({ error: "Crop not found" });
        }

        res.status(200).json({ message: "Crop deleted successfully" });
    } catch (error) {
        console.error("Error deleting crop:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/history-crops", async (req, res) => {
    try {
        console.log("history crops request arrived");
        const { email } = req.query; // Extract email from query params

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Fetch crops where email matches and quantity > 0
        const crops = await cropcolls.find(
            { email: email, quantity: 0 },
            { cropname: 1, price_per_kg: 1, quantity: 1, imageBase64: 1, earnings: 1, "rating.average": 1 } // Select only required fields
        );

        console.log("Fetched Crops:", crops);
        res.json(crops); // Directly send the crops with Base64 image
    } catch (error) {
        console.error("Error fetching active crops:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// app.get("/api/farmers/:farmerId/transactions", async (req, res) => {
//     try {
//         const { farmerId } = req.params;
//         console.log("Received request for farmer ID:", farmerId);

//         if (!mongoose.Types.ObjectId.isValid(farmerId)) {
//             console.error("Invalid Farmer ID format:", farmerId);
//             return res.status(400).json({ message: "Invalid Farmer ID format" });
//         }

//         const farmer = await farmerscoll.findById(farmerId);

//         if (!farmer) {
//             console.error("Farmer not found with ID:", farmerId);
//             return res.status(404).json({ message: "Farmer not found" });
//         }

//         console.log("Farmer found. Returning transactions:", farmer.transactions);
//         res.json({ transactions: farmer.transactions });
//     } catch (error) {
//         console.error("Server error:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

app.get("/api/farmers/:farmerId/transactions", async (req, res) => {
    try {
        const { farmerId } = req.params;
        console.log("Received request for farmer ID:", farmerId);

        if (!mongoose.Types.ObjectId.isValid(farmerId)) {
            console.error("Invalid Farmer ID format:", farmerId);
            return res.status(400).json({ message: "Invalid Farmer ID format" });
        }

        const farmer = await farmerscoll.findById(farmerId);

        if (!farmer) {
            console.error("Farmer not found with ID:", farmerId);
            return res.status(404).json({ message: "Farmer not found" });
        }

        // Ensure transactions have the required fields
        const transactions = farmer.transactions.map((txn) => ({
            cropName: txn.cropName || "Unknown Crop", // Correct field name
            quantityBought: txn.quantityBought || 0, // Correct field name
            coinsEarned: txn.coinsEarned || 0, // Correct field name
            transactionDate: txn.date ? new Date(txn.date).toISOString() : "N/A", // Ensure proper date format
        }));

        console.log("Formatted Transactions:", transactions);
        res.json({ transactions });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




app.get("/user-profile", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const user = await userscoll.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});



// Get crops by category or search term
app.get("/crops", async (req, res) => {
    try {
        const { search } = req.query;
        let query = { quantity: { $gt: 0 } }; // Ensure only crops with quantity > 0 are fetched

        if (search) {
            query.$or = [
                { cropname: { $regex: search, $options: "i" } }, // Search by crop name
                { category: { $regex: search, $options: "i" } }  // Search by category
            ];
        }

        const crops = await cropcolls.find(query);
        res.json(crops);
    } catch (err) {
        res.status(500).json({ message: "Error fetching crops" });
    }
});



app.post("/add-to-cart", async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const user = await userscoll.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update cart using findByIdAndUpdate
        await userscoll.findByIdAndUpdate(userId, {
            $push: { cart: { productId, quantity } },
        });

        res.json({ message: "Added to cart successfully!" });
    } catch (err) {
        console.error("Error adding to cart:", err); // Log error details
        res.status(500).json({ message: "Error adding to cart" });
    }
});



app.get("/cart", async (req, res) => {
    try {
        console.log("Cart fetch request arrived");
        const { userId } = req.query;
        const user = await userscoll.findById(userId).populate("cart.productId");

        if (!user) return res.status(404).json({ message: "User not found" });
        // console.log(user.cart);
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart items", error });
    }
});



app.delete("/cart/remove", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const user = await userscoll.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.cart = user.cart.filter((item) => !item.productId.equals(productId)); // Remove item
        await user.save();

        res.json({ message: "Item removed from cart successfully", cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: "Error removing from cart", error });
    }
});



app.post("/cart/buy", async (req, res) => {
    console.log("Before try in buy");
    try {
        const { userId, productId, rating } = req.body;
        console.log("Buy request arrived, rating received:", rating);

        // Fetch user and populate cart items
        const user = await userscoll.findById(userId).populate("cart.productId");
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        // console.log("User found:", user);

        // Find the specific cart item
        const cartItem = user.cart.find((item) => item.productId._id.toString() === productId);
        if (!cartItem) {
            console.log("Item not found in cart");
            return res.status(400).json({ message: "Item not found in cart" });
        }
        // console.log("Cart item found:", cartItem);

        const crop = await cropcolls.findById(productId);
        if (!crop || crop.quantity < cartItem.quantity) {
            console.log("Insufficient stock or crop not found");
            return res.status(400).json({ message: `Insufficient stock for ${crop ? crop.cropname : "Unknown Crop"}` });
        }
        // console.log("Crop found:", crop);
        console.log("Farmer ID from crop:", crop?.farmerId);

        // Calculate price and update stock
        const amountPaid = cartItem.quantity * crop.price_per_kg;
        crop.quantity -= cartItem.quantity;

        crop.earnings += amountPaid;

        if (!cartItem.quantity || isNaN(cartItem.quantity) || cartItem.quantity <= 0) {
            console.log("Error: Invalid cart item quantity!");
            return res.status(400).json({ message: "Invalid cart item quantity" });
        }

        console.log("Cart Item Quantity (Confirmed Valid):", cartItem.quantity);

        // Push the order history correctly
        user.order_history.push({
            orderId: productId,
            amount_paid: amountPaid,
            quantity: Number(cartItem.quantity), // Convert to number explicitly
        });


        // Update rating
        if (rating && rating >= 1 && rating <= 5) { // Ensure valid rating
            console.log("Updating rating...");
            crop.rating.totalRating += rating; // Add the given rating
            crop.rating.ratingCount += 1; // Increment rating count
            crop.rating.average = crop.rating.totalRating / crop.rating.ratingCount; // Recalculate average rating
            console.log("Updated rating:", crop.rating);
        } else {
            console.log("Invalid rating received:", rating);
        }

        await crop.save();
        console.log("Crop saved successfully");

        // Update farmer's coins
        const farmer = await farmerscoll.findById(crop.farmerId);
        if (!farmer) {
            console.log("Farmer not found");
            return res.status(400).json({ message: "Farmer not found for this crop" });
        }

        await farmerscoll.findByIdAndUpdate(crop.farmerId, { $inc: { coins: amountPaid } });
        console.log("Farmer coins updated");


        // Add transaction record to the farmer's transactions array
        await farmerscoll.findByIdAndUpdate(
            crop.farmerId,
            {
                $push: {
                    transactions: {
                        cropName: crop.cropname, // Correct field name
                        quantityBought: cartItem.quantity, // Correct field name
                        coinsEarned: amountPaid, // Correct field name
                        date: new Date() // Ensure timestamp is added
                    }
                }
            }
        );


        // Remove purchased item from cart
        user.cart = user.cart.filter((item) => item.productId._id.toString() !== productId);
        await user.save();
        console.log("User cart updated successfully");

        res.json({ message: "Purchase successful!", amountPaid, newRating: crop.rating.average });
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ message: "Error processing purchase", error: error.message });
    }
});




app.get("/order-history", async (req, res) => {
    try {
        console.log("Fetching order history...");
        const { userId } = req.query;

        // ✅ Check if userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

       
        const user = await userscoll.findById(userId).populate("order_history.orderId");

      
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

     
        res.status(200).json({
            status: "success",
            order_history: user.order_history.map((order) => ({
                orderId: order.orderId?._id, // Order ID
                imageBase64: order.orderId?.imageBase64,
                cropname: order.orderId?.cropname, // Crop Name
                category: order.orderId?.category, // Crop Category
                price_per_kg: order.orderId?.price_per_kg, // Crop Price
                quantity: order.quantity, // Quantity Purchased
                total_price: order.amount_paid, // Total Paid Amount 
                date: order.date // Order Date
            }))
        });

    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Error fetching order history", error });
    }
});



app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find user and populate the crop details from cropcolls
        const user = await userscoll.findById(userId).populate({
            path: "order_history.orderId",
            select: "cropname" // Fetch only the crop name
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Mapping transactions with populated crop details
        const transactions = user.order_history.map(order => ({
            cropname: order.orderId ? order.orderId.cropname : "Unknown",
            quantity: order.quantity,
            amount_paid: order.amount_paid,
            transaction_date: order.date
        }));

        res.json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
});


const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

const translate = new Translate({ key: GOOGLE_TRANSLATE_API_KEY });

// ✅ Function to detect language
const detectLanguage = async (text) => {
  try {
    const [detection] = await translate.detect(text);
    return detection.language;
  } catch (error) {
    console.error("Error detecting language:", error);
    return "en"; // Default to English if detection fails
  }
};

// ✅ Function to translate text
const translateText = async (text, targetLang) => {
  try {
    const [translatedText] = await translate.translate(text, targetLang);
    return translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Return original text if translation fails
  }
};

// ✅ Function to handle AI Chatbot logic
async function runChat(userInput) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 1000,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ 
            text: `
            You are AgriBot, an advanced agriculture assistant specializing in market intelligence, crop insights, and direct market access for farmers. Your primary role is to assist farmers in Maharashtra with real-time market trends, crop pricing, and agricultural insights. Only provide information related to agriculture, specifically:

            1 *Market Trends & Pricing*  
               - Provide real-time APMC market prices for different crops.  
               - Refer to Agmarknet (https://agmarknet.gov.in/) for the latest market rates.  
               - Recommend the most profitable markets for selling a specific crop based on demand and price fluctuations.  

            2️ *Most Consumed Crops & Regional Insights*  
               - Answer queries on top crops grown and consumed in a given district or state.  
               - Suggest crops that are highly profitable based on regional demand.  

            3️ *Direct Market Access & Smart Selling*  
               - Guide farmers on where they can sell their crops for maximum profit.  
               - Analyze transportation costs to suggest the best market options.  

            4️ *Crop-Specific Advisory*  
               - Provide best practices for growing and selling crops.  
               - Give harvest recommendations based on soil and climate conditions.  

            By default, focus only on Maharashtra unless another state is specified.  
            Politely refuse unrelated queries.
            `
          }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm AgriBot, your agriculture assistant. How can I help you today?" }],
        },
      ],
    });

    const result = await chat.sendMessage(userInput);
    return result.response.text();
  } catch (error) {
    console.error("Error in AI chatbot:", error);
    return "Sorry, I couldn't process your request.";
  }
}



// ✅ API: Detect Language
app.post("/detect-language", async (req, res) => {
  try {
    const [detection] = await translate.detect(req.body.text);
    res.json({ language: detection.language });
  } catch (error) {
    res.status(500).json({ error: "Error detecting language" });
  }
});

// ✅ API: Translate Text
app.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const [translatedText] = await translate.translate(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: "Error translating text" });
  }
});

// ✅ API: Chatbot with Multilingual Support
app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // 🔹 Detect language of user input
    const detectedLanguage = await detectLanguage(userInput);

    // 🔹 Translate user input to English before sending to chatbot
    const translatedInput = await translateText(userInput, "en");

    // 🔹 Get chatbot response (processed in English)
    const chatbotResponse = await runChat(translatedInput);

    // 🔹 Translate chatbot response back to detected language
    const translatedResponse = await translateText(chatbotResponse, detectedLanguage);

    res.json({ response: translatedResponse, detectedLanguage });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, () => {
    console.log(`Server running on ${port}`);
})