from flask import Flask,request, render_template,jsonify
import requests
import pickle
import pandas as pd
import os
from dotenv import load_dotenv
import numpy as np
import json
import google.generativeai as genai
import re
import random
from flask_cors import CORS
import time
import concurrent.futures


load_dotenv()
app = Flask(__name__)
CORS(app)

#loading models
try:
    # Yield prediction model and preprocessor
    yield_model = pickle.load(open('models/cropyield/model.pkl', 'rb'))
    yield_preprocessor = pickle.load(open('models/cropyield/preprocessor.pkl', 'rb'))
    # WPI model and preprocessor
    wpi_model = pickle.load(open('models/wpi/model.pkl', 'rb'))
    wpi_preprocessor = pickle.load(open('models/wpi/preprocessor.pkl', 'rb'))
    # Market price model
    market_price_model = pickle.load(open('models/marketprice/model.pkl', 'rb'))
    market_price_preprocessor = pickle.load(open('models/marketprice/preprocessor.pkl', 'rb'))
     # rainfall prediction model and preprocessor
    rainfall_model = pickle.load(open('models/rainfall/model.pkl', 'rb'))
    rainfall_preprocessor = pickle.load(open('models/rainfall/preprocessor.pkl', 'rb'))
    # temperature model and preprocessor
    temperature_model = pickle.load(open('models/temperature/model.pkl', 'rb'))
    temperature_preprocessor = pickle.load(open('models/temperature/preprocessor.pkl', 'rb'))
    
except FileNotFoundError as e:
    raise FileNotFoundError(f"Required file missing: {e}")

# gemini configuration
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key = API_KEY)
geminimodel = genai.GenerativeModel("gemini-1.5-flash")

# fule data key
DAILY_FULE_DATA_KEY = os.getenv("DAILY_FULE_DATA_KEY")

# gemini request
def gemini_response(Prompt):
    response = geminimodel.generate_content(Prompt)
    return response

# format data (gemini response)
def get_data(Prompt):
    response = gemini_response(Prompt)
    try:
        json_string = response.text.strip()
        json_string = re.sub(r"```(?:json)?\s*", "", json_string)
        json_string = re.sub(r"```", "", json_string)
        json_data = json.loads(json_string)
        return json_data
    
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
        return None
    except Exception as e:
        print("Error:", e)
        return None

# Crop MSP and Average Price Dictionary (Prices in INR per Quintal)
commodity_price = {
    'Bajra': {'avg_price': 1900, 'msp_price': 2500},
    'Barley': {'avg_price': 1600, 'msp_price': 2200},
    'Cotton': {'avg_price': 5500, 'msp_price': 6620},
    'Gram': {'avg_price': 4500, 'msp_price': 5440},
    'Groundnut': {'avg_price': 5000, 'msp_price': 6377},
    'Jowar': {'avg_price': 2300, 'msp_price': 3180},
    'Maize': {'avg_price': 1800, 'msp_price': 2225},
    'Masoor': {'avg_price': 4600, 'msp_price': 6400},
    'Moong': {'avg_price': 6000, 'msp_price': 8558},
    'Soyabean': {'avg_price': 3500, 'msp_price': 4600},
    'Sugarcane': {'avg_price': 290, 'msp_price': 315},  # Per Quintal
    'Tur': {'avg_price': 5000, 'msp_price': 7000},
    'Urad': {'avg_price': 4800, 'msp_price': 6950},
    'Wheat': {'avg_price': 2100, 'msp_price': 2275}
}

markets_data = {
    "Kolhapur": ["Kolhapur", "Vadgaonpeth"],
    "Pune": [
        "Pune", "Pune(Pimpri)", "Junnar(Otur)", "Pune(Moshi)", "Junnar(Alephata)", 
        "Manchar", "Junnar", "Nira(Saswad)", "Pune(Khadiki)", "Shirur", "Baramati", 
        "Nira", "Khed(Chakan)", "Bhor", "Pune(Manjri)", "Indapur(Nimgaon Ketki)", 
        "Dound", "Indapur", "Mulshi", "Junnar(Narayangaon)", "Indapur(Bhigwan)"
    ],
    "Sangli": [
        "Sangli", "Vita", "Islampur", "Sangli(Miraj)", "Palus", 
        "Sangli(Phale, Bhajipura Market)", "Tasgaon"
    ],
    "Satara": ["Vai", "Satara", "Phaltan", "Vaduj", "Karad", "Koregaon", "Lonand"],
    "Solapur": [
        "Akluj", "Laxmi Sopan Agriculture Produce Marketing Co Ltd", "Pandharpur", 
        "Mangal Wedha", "Mohol", "Kurdwadi(Modnimb)", "Karmala", "Barshi", "Solapur", 
        "Dudhani", "Akkalkot", "Barshi(Vairag)", "Kurdwadi"
    ]
}

subdistrict_data = {
    "Kolhapur": ["Kolhapur", "Vadgaonpeth"],
    "Pune": [
        "Pune", "Pune(Pimpri)", "Junnar(Otur)", "Pune(Moshi)", "Junnar(Alephata)", 
        "Manchar", "Junnar", "Nira(Saswad)", "Pune(Khadiki)", "Shirur", "Baramati", 
        "Nira", "Khed(Chakan)", "Bhor", "Pune(Manjri)", "Indapur(Nimgaon Ketki)", 
        "Dound", "Indapur", "Mulshi", "Junnar(Narayangaon)", "Indapur(Bhigwan)"
    ],
    "Sangli": [
        "Sangli", "Vita", "Islampur", "Sangli(Miraj)", "Palus", 
        "Sangli(Phale, Bhajipura Market)", "Tasgaon"
    ],
    "Satara": ["Vai", "Satara", "Phaltan", "Vaduj", "Karad", "Koregaon", "Lonand"],
    "Solapur": [
        "Akluj", "Laxmi Sopan Agriculture Produce Marketing Co Ltd", "Pandharpur", 
        "Mangal Wedha", "Mohol", "Kurdwadi(Modnimb)", "Karmala", "Barshi", "Solapur", 
        "Dudhani", "Akkalkot", "Barshi(Vairag)", "Kurdwadi"
    ]
}

# for yield and market price model
def getMahaAnnualRainfall(year,district):
    prompt = f"""Analyze the previous rainfall conditions and pattern in Maharashtra state and predict 
                the Annual rainfall for year : {year} and district :{district} in maharashtra. 
                you need to predict the rainfall year and district wise.
                Output the rainfall in mm. only rainfall value , No any explanation or other text
                output in json format.
                ### ouput format :  34.5 
                """
    rainfall = get_data(prompt)
    return rainfall

# for wpi model
def getIndiaRainfallMonthly(year,month):
    prompt = f"""Analyze the previous rainfall conditions and pattern in India and predict 
                the rainfall for year : {year} and month {month} in india. 
                Output the rainfall in mm. only rainfall value , No any explanation or other text.
                output in json format.
                ### ouput format :  154.5 
                """
    rainfall = get_data(prompt)
    return rainfall

# for yield temperature
def getMahaTemp(year,district):
    prompt = f"""Analyze the previous temperature conditions and pattern in maharashtra and predict the     
                temperature for year : {year} and district {district} in maharashtra.  
                Output the temperature in Celsius.
                you need to predict the temperature according to year, and district in maharashtra.
                only temperature value , No any explanation or other text.
                output in json format.
                ### ouput format :  25.5 
                """
    temperature = get_data(prompt)
    return temperature

# crop selection guide
def getCropSelectionConclusion(IntelCropData,Nitrogen,Potassium,Phosphorus,soilColor,pH):
    Prompt = f"""
        You are an expert in crop selection. I will provide you with data that includes:
        The expected total price and yield for various crops.
        Meteorological and soil data relevant to crop growth.
        Based on this data, suggest the most profitable crop that is also suitable for the given soil conditions.
        In output only suggested crop and reasoning no any desclaimers.
        Output Format: JSON 
        suggested_crop
        reasoning
        
        Price and yield data : {IntelCropData},
        Nitrogen : {Nitrogen},
        Potassium : {Potassium},
        Phosphorus : {Phosphorus},
        soilColor : {soilColor},
        pH : {pH}
    """
    data = get_data(Prompt)
    return data

# market selection guide
def getMarketSelectionConclusion(MarketData,transportation_data,sourceDistrict):
    Prompt = f"""
            You are expert in market selection i will provide you the market and the crop prices in that market.
            your job is to guide the farmer to decide the market which gives highest profit.
            On the basis of crop price in that market and the transportation cost required to reach that market.
            in reasoning you can add some statistic reasoning so that it become more strong.
            
            marketData : {MarketData}
            transportationData : {transportation_data}
            sourceDistrict : {sourceDistrict}
            
            output format : JSON
            suggested_market : <market> <price in that market ₹/Qtl>
            reasoning
            
            In output no any desclaimers or voage statements. in output Do not return marketData or transprotation data just return suggested_market reasoning.
    """
    data = get_data(Prompt)
    return data

# guide for which option to choose
def getSellingDecision(commodity,marketPriceData,govMarketPrice,storageAvailability):
    prompt = f"""
            Assume that you are the farmer guide , guiding farmer to sell their product. now for farmer he have a three choices to sell their product 
            
            1. goverment market
            2. Local Market
            3. Direct selling to customers
            
            now I will provide you the prices in goverment markets , local markets and if farmer choose third option then it is sure that it will get the max profit. as in markets the prices are decided by middle man but in third option price is decided by farmer himself.but for third option problem is storage , if farmer go for third option then he should have the storage Avalability. so always third option is not max profitable you also need to consider the commodity as some commodities cannot stored for long time so in that case 3rd option is not helpful.So consider all possibilites and guide the farmer.
            
            ### Data
            Commodity : {commodity}
            marketPriceData : {marketPriceData} ,
            govMarketPriceMax : {govMarketPrice[1]} ,
            govMarketPriceMin : {govMarketPrice[0]} ,
            govMarketPriceAvg : {govMarketPrice[2]} ,
            storageAvailability : {storageAvailability}
            
            Your task to analyze the all data and guide the farmer which path he/she should choose and why with the price details you need to convince the farmer to choose the correct path that gives max profit.
            
            ### decision format :
            if local market specify which market and the corresponding price 
            ex. Local Market (Pune,Baramati,2500 ₹ per Quintal)
            
            if goverment market then
            ex. APMC Market (Price : <highest price> ₹ per Quintal)
            
            if Direct sell to customer
            then only Direct Sell to Customer
            
            ### reasoning
            reasoning for the given decision.
            
            ## Do NOT include disclaimers or vague statements.  .
            
            return ans in json format.
            """
    
    data = get_data(prompt)
    return data

# Gemini in use
def geminiInUse(cropname):
    # Market Info
    Prompt = f"""Provide information about the 5 best markets for selling {cropname} in Maharashtra in JSON format. The JSON should be an array of objects. Each object should have the following keys: 'market_name', 'strengths' (an array of strings), and 'best_for'.do not write the disclaimer only json data of markets"""
    market_data = get_data(Prompt)
    
    # Goverment Schemes
    Prompt = f"""Provide information about 3 Indian government schemes related to {cropname} farming in JSON format. The JSON should be an array of objects. Each object should have the following keys: 'scheme_name', 'purpose', and 'benefits' (which should be an array of strings). do not write the disclaimer or extra information only json data of goverment scheme in specified format"""
    goverment_data = get_data(Prompt)
    
    return market_data,goverment_data

# rainfall and temperature prediction
def rainfallAndTempreturePrediction(subdivision,year):
    months = random.sample(range(1, 13), 6)
    aggregated_rainfall = 0
    aggregated_temperature = 0
        
    for month in months:
        # rainfall predictions
        column_names_rainfall_model = ['SUBDIVISION','YEAR','MONTH']
        features = [[subdivision,year,month]]
        features_df = pd.DataFrame(features, columns=column_names_rainfall_model)
        transformed_features = rainfall_preprocessor.transform(features_df)
        prediction = rainfall_model.predict(transformed_features).reshape(1,-1)
        rainfall = round(prediction[0][0] , 2)
        aggregated_rainfall+=rainfall
    
        # tempreture prediction
        column_names_temperature_model = ['YEAR','MONTH']
        features = [[year,month]]
        features_df = pd.DataFrame(features, columns=column_names_temperature_model)
        transformed_features = temperature_preprocessor.transform(features_df)
        prediction = temperature_model.predict(transformed_features).reshape(1,-1)
        temperature = round(prediction[0][0] , 2)
        aggregated_temperature+=temperature
    
    aggregated_rainfall = round(aggregated_rainfall/6,2)
    aggregated_temperature = round(aggregated_temperature/6,2)
   
    return aggregated_rainfall,aggregated_temperature

# yield prediction function
def yieldPrediction(Year, District, Commodity, Area, Rainfall, Temperature, Soil_color, Fertilizer, Nitrogen, Phosphorus, Potassium, pH):
    column_names = ['Year', 'District', 'Commodity', 'Area', 'Rainfall', 'Temperature','Soil_color','Fertilizer', 'Nitrogen', 'Phosphorus', 'Potassium', 'pH']
    features = [[Year, District, Commodity, Area, Rainfall, Temperature, Soil_color, Fertilizer, Nitrogen, Phosphorus, Potassium, pH]]
    features_df = pd.DataFrame(features, columns=column_names)
    transformed_features = yield_preprocessor.transform(features_df)
    prediction = yield_model.predict(transformed_features).reshape(1,-1)
    predicted_yield = round(prediction[0][0] , 2)
    return predicted_yield

# market price
def marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall):
    column_names = ['District', 'Market', 'Commodity', 'Year', 'Month','Rainfall']
    features = [[District, Market, Commodity, Year, Month, Rainfall]]
    features_df = pd.DataFrame(features, columns=column_names)
    transformed_features = market_price_preprocessor.transform(features_df)
    prediction = market_price_model.predict(transformed_features).reshape(1,-1)
    predicted_market_price = round(prediction[0][0] , 2)
    return predicted_market_price

# market data district wise
def marketPriceSeries(District, Commodity, Year, Month):
    markets = markets_data.get(District, [])
    marketPriceData = {}
    
    Rainfall = getMahaAnnualRainfall(Year, District)
    
    for Market in markets:
        marketPrice = marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall)
        marketPriceData[Market] = marketPrice
    
    return marketPriceData

# market data of all district
def getAllMarketPrice(Commodity, Year, Month):
    marketPriceData = {}
    for District in markets_data:
        Rainfall = getMahaAnnualRainfall(Year, District)
        markets = markets_data.get(District, [])
        districtMarketData = {}
        for Market in markets:
            marketPrice = marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall)
            districtMarketData[Market] = marketPrice 
        marketPriceData[District] = districtMarketData
        # time.sleep(1000)
    return marketPriceData

# wpi prediction
def wpiPrediction(Commodity, Month, Year, Rainfall):
    column_names = ['Commodity','Month','Year','Rainfall']
    features = [[Commodity, Month, Year, Rainfall]]
    features_df = pd.DataFrame(features, columns=column_names)
    transformed_features = wpi_preprocessor.transform(features_df)
    prediction = wpi_model.predict(transformed_features).reshape(1,-1)
    predicted_wpi = round(prediction[0][0] , 2)
    return predicted_wpi

# wpi price calculation
def wpiPricePrediction(Commodity, Month, Year, Rainfall):
    wpi = wpiPrediction(Commodity, Month, Year, Rainfall)
    commodity_avg_price = commodity_price[Commodity]['avg_price']
    commodity_msp_price = commodity_price[Commodity]['msp_price']
    min_wpi_price = round((wpi*commodity_avg_price)/100,2)
    max_wpi_price = round((wpi*commodity_msp_price)/100,2)
    avg_wpi_price = round((min_wpi_price + max_wpi_price) / 2,2)
    return min_wpi_price,max_wpi_price,avg_wpi_price

def wpiPriceWholeYear(Commodity,Year):
    min_price_data = []
    msp_data = []
    Month = 1 
    rainfallData = [1,2,3,1,8,673,1318,779,408,106,44,8]
    x_count =0 
    for rainfall in rainfallData:
        min_wpi_price,max_wpi_price,avg_wpi_price = wpiPricePrediction(Commodity,Month,Year,rainfall)
        msp_data.append(max_wpi_price)
        min_price_data.append(min_wpi_price)
        Month = Month + 1
        x_count = x_count + 1
    return min_price_data,msp_data

def getIntelCropData(Commoditys, Year, Month, District, Area, Nitrogen, Potassium, Phosphorus, Fertilizer, soilColor, pH):
    wpi_Rainfall = getIndiaRainfallMonthly(Year, Month)
    Rainfall = getMahaAnnualRainfall(Year, District)
    Temperature = getMahaTemp(Year, District)
    IntelCroprecData = {}

    for Commodity in Commoditys:
        min_wpi_price, max_wpi_price, predicted_price = wpiPricePrediction(Commodity, Month, Year, wpi_Rainfall)
        predicted_yield = yieldPrediction(Year, District, Commodity, Area, Rainfall, Temperature, soilColor, Fertilizer, Nitrogen, Phosphorus, Potassium, pH)
        totalPrice = round((predicted_yield*Area*predicted_price), 2)
        
        # Corrected dictionary assignment
        IntelCroprecData[Commodity] = {
            "predicted_price": predicted_price,
            "predicted_yield": predicted_yield,
            "area":Area,
            "totalPrice": totalPrice
        }
    return IntelCroprecData

# get coordinates
def get_coordinates(subdistrict, district):
    subdistrict = subdistrict.lower()
    district = district.lower()
    # query = ${taluka}, ${district}, Maharashtra, India
    query = f"{subdistrict}, {district}, Maharashtra"
    url = f"https://nominatim.openstreetmap.org/search?format=json&countrycodes=IN&addressdetails=1&q={query}"
    
    try:
        headers = {
            "User-Agent": "kisan-dss/1.0",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
        }
        response = requests.get(url,headers=headers)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return None
        
        # Parse the JSON response
        data = response.json()
        
        if data:
            for item in data:
                if item.get("address"):
                    taluka_match = item["address"].get("county") or item["address"].get("suburb") or item["address"].get("town") or item["address"].get("village")
                    district_match = item["address"].get("state_district") or item["address"].get("county") or item["address"].get("state")
                    
                    # Check if the subdistrict and district match
                    if taluka_match and district_match and subdistrict.lower() in taluka_match.lower() and district.lower() in district_match.lower():
                        print("ok")
                        return {"lat": float(item["lat"]), "lon": float(item["lon"])}
        
        # If no matching data is found
        print("No matching data found.")
        return None
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except ValueError as e:
        print(f"Failed to parse JSON: {e}")
        print("Response:", response.text)
        return None

# get distance and duration
def calculate_osrm_distance(source_coords, destination_coords):
    url = f"http://router.project-osrm.org/route/v1/driving/{source_coords['lon']},{source_coords['lat']};{destination_coords['lon']},{destination_coords['lat']}?overview=false"
    response = requests.get(url)
    data = response.json()
    if data.get("routes"):
        distance = data["routes"][0]["legs"][0]["distance"] / 1000 
        duration = data["routes"][0]["legs"][0]["duration"] / 60 
        return {"distance": distance, "duration": duration}
    return None

# Function to fetch fuel prices
def fetch_fuel_prices(district):
    district = district.lower()
    url = f"https://daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com/v1/fuel-prices/today/india/maharashtra/{district}"
    headers = {
        "x-rapidapi-key": DAILY_FULE_DATA_KEY,
        "x-rapidapi-host": "daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com",
    }
    response = requests.get(url, headers=headers)
    return response.json()

def calculateTransportationDistance(coords_source,fuel_prices,des_district,mileage):
    subdistricts = markets_data[des_district]
    transportation_data_all = {}
    transportation_data = {}
    for des_subdistrict in subdistricts:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_coords_destination = executor.submit(get_coordinates, des_subdistrict,des_district)
            coords_destination = future_coords_destination.result()
            
        if coords_source and coords_destination:
            distance_result = calculate_osrm_distance(coords_source, coords_destination)
            if distance_result:
                transportation_cost = (distance_result["distance"] / mileage) * fuel_prices["fuel"]["diesel"]["retailPrice"]
                data = {
                    "distance": round(distance_result["distance"], 2),  
                    "duration": round(distance_result["duration"], 2),  
                    "transportation_cost": round(transportation_cost, 2),  
                    "fuel_prices": round(fuel_prices["fuel"]["diesel"]["retailPrice"], 2) 
                }
            transportation_data[des_subdistrict] = data
            transportation_data_all[des_subdistrict] = data
        else :
            data = {
                    "distance":'N/A',  
                    "duration": 'N/A', 
                    "transportation_cost": 'N/A', 
                    "fuel_prices": 'N/A'
                }
            transportation_data_all[des_subdistrict] = data
            
    return transportation_data_all,transportation_data

def getTransportationData(src_subdistrict,src_district,des_district,milage):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_coords_source = executor.submit(get_coordinates, src_subdistrict,src_district)
        future_fuel_prices = executor.submit(fetch_fuel_prices, src_district)
        coords_source = future_coords_source.result()
        fuel_prices = future_fuel_prices.result()
        
    transportation_data_all,transportation_data = calculateTransportationDistance(coords_source,fuel_prices,des_district,milage)
    # print(transportation_data_all)
    return transportation_data_all,transportation_data

@app.route('/')
def index():
    return ("Server running on localhost:5000")

@app.route('/intel-market-price',methods=['POST'])
def marketPrice():
    if request.method == 'POST':
        data = request.get_json()
        Commodity = data.get('commodity')
        Year = data.get('year')
        Month = data.get('month')
        srcSubdistrict = data.get('srcSubdistrict')
        srcDistrict = data.get('srcDistrict')
        desDistrict = data.get('desDistrict')
        milage  = data.get('milage')
        
        Year = int(Year)
        Month = int(Month)
        milage = int(milage)
       
        marketPriceData = marketPriceSeries(srcDistrict, Commodity, Year, Month)
        transportation_data_all,transportation_data = getTransportationData(srcSubdistrict,srcDistrict,desDistrict,milage)
        conclusion = getMarketSelectionConclusion(marketPriceData,transportation_data,srcDistrict)
        
        # print(conclusion)
        return jsonify({'data':marketPriceData,'transportationData':transportation_data_all,'conclusion':conclusion})

@app.route('/intel-trasport-analysis',methods=['GET'])
def getTrasportAnalysis():
    if request.method == 'GET':
        # data = request.get_json()
        # srcSubdistrict  = data.get('srcSubdistrict')
        # srcDistrict  = data.get('srcDistrict')
        # desDistrict  = data.get('desDistrict')
        # milage  = data.get('milage')
        srcSubdistrict  = "Madha"
        srcDistrict  = "Solapur"
        desDistrict  = "Pune"
        milage  = 25
        transportation_data_all,transportation_data = getTransportationData(srcSubdistrict,srcDistrict,desDistrict,milage)
        return jsonify({'data':transportation_data_all})

@app.route('/intel-wpi-price',methods=['POST'])
def IntelWPI():
    if request.method == 'POST':
        data = request.get_json()
        Commodity = data.get('commodity')
        Year = data.get('year')
        Month = data.get('month')
        
        Year = int(Year)
        Month = int(Month)
        
        Rainfall = getIndiaRainfallMonthly(Year,Month)
        
        avgPrice,minPrice,maxPrice = wpiPricePrediction(Commodity,Month,Year,Rainfall)
        
        minPriceCurrSeries,maxPriceCurrSeries = wpiPriceWholeYear(Commodity,Year)
        minPriceNextSeries,maxPriceNextSeries = wpiPriceWholeYear(Commodity,Year+1)
        
        maxMSPPrice = max(maxPriceCurrSeries)
        maxAvgPrice = max(minPriceCurrSeries)
        minMSPPrice = min(maxPriceCurrSeries)
        minAvgPrice = min(minPriceCurrSeries)

        goldMonthIndex = maxPriceCurrSeries.index(maxMSPPrice) + 1
        silverMonthIndex = maxPriceCurrSeries.index(minMSPPrice) + 1
        
        return jsonify({
            'rainfall':Rainfall,
            'commodity':Commodity,
            'year':Year,
            'month':Month,
            'avgPrice':avgPrice,
            'minPrice':minPrice,
            'maxPrice':maxPrice,
            'minPriceCurrSeries':minPriceCurrSeries,
            'maxPriceCurrSeries':maxPriceCurrSeries,
            'minPriceNextSeries':minPriceNextSeries,
            'maxPriceNextSeries':maxPriceNextSeries,
            'maxMSPPrice':maxMSPPrice,
            'maxAvgPrice':maxAvgPrice,
            'minMSPPrice':minMSPPrice,
            'minAvgPrice':minAvgPrice,
            'goldMonthIndex':goldMonthIndex,
            'silverMonthIndex':silverMonthIndex,
        })
        
@app.route('/intel-crop-recommendation',methods=['POST'])
def IntelCropRec():
    if request.method == 'POST':
        data = request.get_json()
        Commoditys = data.get('crops')
        Year = data.get('year')
        Month = data.get('month')
        District = data.get('district')
        Area = data.get('area')
        Fertilizer = data.get('fertilizer')
        Nitrogen = data.get('nitrogen')
        Phosphorus = data.get('phosphorus')
        Potassium = data.get('potassium')
        pH = data.get('pH')
        soilColor  = data.get("soilColor")
        try:
            Year = int(Year)
            Month = int(Month)
            Area = float(Area)
            Nitrogen = float(Nitrogen)
            Phosphorus = float(Phosphorus)
            Potassium = float(Potassium)
            pH = float(pH)
        except ValueError:
            print("Error data conversion")
            return jsonify({"error": "Invalid input format for numbers"}), 400

        IntelCropData = getIntelCropData(Commoditys,Year,Month,District,Area,Nitrogen,Potassium,Phosphorus,Fertilizer,soilColor,pH)
        conclusion = getCropSelectionConclusion(IntelCropData,Nitrogen,Potassium,Phosphorus,soilColor,pH)
        return jsonify({'data':IntelCropData,'conclusion':conclusion})

# result route
@app.route('/intel-yield',methods=['POST'])
def IntelYield():
    if request.method == 'POST':
        data = request.get_json()
        Commodity = data.get('commodity')
        Year = data.get('year')
        District = data.get('district')
        Area = data.get('area')
        Soil_color = data.get('soilColor')
        Fertilizer = data.get('fertilizer')
        Nitrogen = data.get('nitrogen')
        Phosphorus = data.get('phosphorus')
        Potassium = data.get('potassium')
        pH = data.get('pH')

        if not all([Commodity, Year, District, Area, Soil_color, Fertilizer, Nitrogen, Phosphorus, Potassium, pH]):
            return jsonify({"error": "All fields are required"}), 400

        try:
            Year = int(Year)
            # Month = int(Month)
            Area = float(Area)
            Nitrogen = float(Nitrogen)
            Phosphorus = float(Phosphorus)
            Potassium = float(Potassium)
            pH = float(pH)
        except ValueError:
            print("Error data conversion")
            return jsonify({"error": "Invalid input format for numbers"}), 400

      
        # current year rainfall and temperature prediction
        Rainfall = getMahaAnnualRainfall(Year,District)
        Temperature = getMahaTemp(Year,District)
        # current year crop yield
        yield_prediction = yieldPrediction(Year, District, Commodity, Area, Rainfall, Temperature, Soil_color, Fertilizer, Nitrogen, Phosphorus, Potassium, pH)
        # current year crop yield in tonnes
        yield_prediction_tonnes = round(yield_prediction/10,2)
        
        # Gemini In Use
        market_data,goverment_data = geminiInUse(Commodity)

        return jsonify({
            'yieldPrediction': yield_prediction,
            'yieldPredictionTonnes': yield_prediction_tonnes,
            'commodity': Commodity,
            'state': "Maharashtra",
            'district': District,
            'area': Area,
            'rainfall': Rainfall,
            'temperature': Temperature,
            'year': Year,
            'marketData': market_data,
            'governmentData': goverment_data
        })
        
@app.route('/intel-build-decision',methods=['POST'])
def getDecision():
    if request.method == 'POST':
        data = request.get_json()
        Commodity = data.get('commodity')
        Year = data.get('year')
        Month = data.get('month')
        storageAvailability = data.get('storageAvailability')
        
        Year = int(Year)
        Month = int(Month)
        
        Rainfall = getIndiaRainfallMonthly(Year,Month)
        govMarketPrice = wpiPricePrediction(Commodity,Month,Year,Rainfall)

        marketPriceData = getAllMarketPrice(Commodity,Year,Month)
      
        highestLocalMarketPrice = -1 
        localMarketName = None
        districtName = None

        for district, market_data in marketPriceData.items():
            for market, price in market_data.items():
                if price > highestLocalMarketPrice:
                    highestLocalMarketPrice = price
                    localMarketName = market
                    districtName = district

        decision = getSellingDecision(Commodity,marketPriceData,govMarketPrice,storageAvailability)
        
        return jsonify({
                        'decision':decision,
                        'govMarketPrice':govMarketPrice,
                        'highestLocalMarketPrice':highestLocalMarketPrice,
                        'localMarketName':localMarketName,
                        'districtName':districtName})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
