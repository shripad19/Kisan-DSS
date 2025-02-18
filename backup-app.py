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
DAILY_FUEL_DATA_KEY = os.getenv("DAILY_FUEL_DATA_KEY")


# gemini request and response formating


def gemini_response(Prompt):
    response = geminimodel.generate_content(Prompt)
    return response

def get_data(Prompt):
    response = gemini_response(Prompt)
    print(response.text)
    if not response or not response.text:  
        print("Error: Empty response from the model.")
        return None  

    try:
        json_string = response.text.strip()
        
        # Extract JSON content using a more robust regex
        json_match = re.search(r"\{.*\}", json_string, re.DOTALL)
        
        if not json_match:
            print("Error: No valid JSON found in response.")
            return None
        
        json_data = json.loads(json_match.group())  
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

# Market list district wise
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

#  Subdistrict of corresponding market list
subdistrict_data = {
     "Kolhapur": {"Kolhapur": "Radhanagari", "Vadgaonpeth": "Hatkanangle"},

    "Pune": {
        "Pune": "Haveli", "Pune(Pimpri)": "Haveli", "Junnar(Otur)": "Junnar", "Pune(Moshi)": "Khed", "Junnar(Alephata)": "Junnar", 
        "Manchar": "Ambegaon", "Junnar": "Junnar", "Nira(Saswad)": "Purandhar", "Pune(Khadiki)": "Haveli", "Shirur": "Shirur", "Baramati": "Baramati", 
        "Nira": "Baramati", "Khed(Chakan)": "Khed", "Bhor": "Bhor", "Pune(Manjri)": "Haveli", "Indapur(Nimgaon Ketki)": "Indapur", 
        "Dound": "Daund", "Indapur": "Indapur", "Mulshi": "Mulshi", "Junnar(Narayangaon)": "Junnar", "Indapur(Bhigwan)": "Indapur"
    },


    "Sangli": {
        "Sangli": "Miraj", "Vita": "Vita", "Islampur": "Walwa", "Sangli(Miraj)": "Miraj", "Palus": "Palus", 
        "Sangli(Phale, Bhajipura Market)": "Miraj", "Tasgaon": "Tasgaon"
    },


    "Satara": {"Vai": "Wai", "Satara": "Koregaon", "Phaltan": "Phaltan", "Vaduj": "Khatav", "Karad": "Karad", "Koregaon": "Koregaon", "Lonand": "Phaltan"},
    

"Solapur": {
        "Akluj": "Malshiras", "Laxmi Sopan Agriculture Produce Marketing Co Ltd": "Barshi", "Pandharpur": "Pandharpur", 
        "Mangal Wedha": "Mangalvedhe", "Mohol": "Mohol", "Kurdwadi(Modnimb)": "Madha", "Karmala": "Karmala", "Barshi": "Barshi", "Solapur": "Solapur", 
        "Dudhani": "Akkalkot", "Akkalkot": "Akkalkot", "Barshi(Vairag)": "Barshi", "Kurdwadi": "Madha"
    }
}

# function map market to subdistrict
def get_subdistrict(market):
    for district, subdistricts in subdistrict_data.items():
        if market in subdistricts:
            return subdistricts[market]
    return market 



##### Gemini Model Prompt


# Market price prediction
def getMahaAnnualRainfall(year, district):
    prompt = f"""Based on historical rainfall data and climatic patterns in Maharashtra, 
                predict the **annual rainfall** for the year {year} in the district of {district}.
                
                - Use previous rainfall data trends for the district and Maharashtra state to make the prediction.
                - Consider typical rainfall ranges:
                    - **January to May**: Typically dry, with rainfall between **0 mm to 100 mm**.
                    - **June to September (Monsoon Season)**: Heavy rainfall, ranging from **500 mm to 1500 mm**, with the peak usually in **July**.
                    - **October to December**: Moderate rainfall, between **50 mm to 300 mm**.
                - Output the **annual rainfall in millimeters (mm)**.
                - Ensure the rainfall value is realistic and falls within the typical ranges for the region.
                - Provide only the **rainfall value** in **JSON format**, without any explanation or additional text.
                
                ### Expected output format:
                {{ "rainfall": 750.5 }}
                
                - The rainfall value should be a **positive floating-point number** (e.g., 1200.5) representing millimeters (mm).
                - Example: 
                {{ "rainfall": 850.2 }}
                """
    rainfall = get_data(prompt)
    print(rainfall)
    return rainfall['rainfall']

# WPI prediction
def getIndiaRainfallMonthly(year, month):
    prompt = f"""Analyze historical rainfall patterns in India and predict the expected rainfall 
                for the year {year} and month {month}. Base your prediction on past trends 
                and ensure the value aligns with India's typical rainfall range.
                
                - The normal range for India's monthly rainfall varies between **10 mm to 400 mm**,
                  except in extreme monsoon months (June-September), where it can reach **800 mm max**.  
                - Ensure the prediction reflects realistic values based on IMD historical data.  
                  
                The response should only contain a **valid JSON object** with the following format:
                {{ "rainfall": <number> }} 
                
                ### Example output format:  
                {{ "rainfall": 154.5 }}  
                """
    rainfall = get_data(prompt)
    print(rainfall)
    return rainfall['rainfall']

# market selection guide
def getMarketSelectionConclusion(MarketData,transportation_data,sourceDistrict):
    Prompt = f"""
            You are expert in market selection i will provide you the market and the crop prices in that market.
            your job is to guide the farmer to decide the market which gives highest profit.
            On the basis of crop price in that market and the transportation cost required to reach that market.
            
            marketData : {MarketData}
            transportationData : {transportation_data}
            sourceDistrict : {sourceDistrict}
            
            output format : JSON
            suggested_market : <market> <price in that market ₹/Qtl>
            reasoning : explain why and how the suggested market gives the max profit.
            
            In output no any desclaimers or voage statements. in output Do not return marketData or transprotation data just return suggested_market reasoning.
            output must be in json format.
    """
    data = get_data(Prompt)
    return data

# guide for which option to choose
def getSellingDecision(Commodity,highestLocalMarketPrice,localMarketName,districtName,govMarketPrice,storageAvailability):
    prompt = f"""
            Assume that you are the farmer guide , guiding farmer to sell their product. now for farmer he have a three choices to sell their product 
            
            1. goverment market
            2. Local Market
            3. Direct selling to customers
            
            now I will provide you the prices in goverment markets , local markets and if farmer choose third option then it is sure that it will get the max profit. as in markets the prices are decided by middle man but in third option price is decided by farmer himself.but for third option problem is storage , if farmer go for third option then he should have the storage Avalability. so always third option is not max profitable you also need to consider the commodity as some commodities cannot stored for long time so in that case 3rd option is not helpful.So consider all possibilites and guide the farmer.
            
            ### Data
            Commodity : {Commodity}
            highestLocalMarketPrice : {highestLocalMarketPrice} ,
            Local Market Name where price is highest :{ localMarketName} ,
            District of local Market Where price is highest : {districtName}
            govMarketPriceMax : {govMarketPrice[1]} ,
            govMarketPriceMin : {govMarketPrice[0]} ,
            govMarketPriceAvg : {govMarketPrice[2]} ,
            storageAvailability : {storageAvailability}
            
            Your task to analyze the all data and guide the farmer which path he/she should choose and why with the price details you need to convince the farmer to choose the correct path that gives max profit.
            
            ### decision format :
            if local market specify which market and the corresponding price 
            ex. Local Market (<district>,<market name>, <price> ₹ per Quintal)
            
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


#### Models In Use


# division wise
# Rainfall year prediction
# def getRainfallDataYearSeries(year):
#     aggregated_rainfall = []
#     for month in range(1,12):
#         column_names_rainfall_model = ['SUBDIVISION','YEAR','MONTH']
#         features = [["Madhya Maharashtra",year,month]]
#         features_df = pd.DataFrame(features, columns=column_names_rainfall_model)
#         transformed_features = rainfall_preprocessor.transform(features_df)
#         prediction = rainfall_model.predict(transformed_features).reshape(1,-1)
#         rainfall = round(prediction[0][0] , 2)
#         aggregated_rainfall.append(rainfall)
#     return aggregated_rainfall
def getRainfallDataYearSeries(year):
    aggregated_rainfall = []
    for month in range(1, 13):
        column_names_rainfall_model = ['SUBDIVISION', 'YEAR', 'MONTH']
        features = [["Madhya Maharashtra", year, month]]
        features_df = pd.DataFrame(features, columns=column_names_rainfall_model)

        try:
            transformed_features = rainfall_preprocessor.transform(features_df)
            prediction = rainfall_model.predict(transformed_features).reshape(1, -1)
            rainfall = round(prediction[0][0], 2)
            aggregated_rainfall.append(rainfall)
        except Exception as e:
            print(f"Error processing rainfall data for year {year}, month {month}: {e}")
            aggregated_rainfall.append(None)
            
    return aggregated_rainfall

# Rainfall value prediction
# def getRainfallValue(year,month):
#     column_names_rainfall_model = ['SUBDIVISION','YEAR','MONTH']
#     features = [["Madhya Maharashtra",year,month]]
#     features_df = pd.DataFrame(features, columns=column_names_rainfall_model)
#     transformed_features = rainfall_preprocessor.transform(features_df)
#     prediction = rainfall_model.predict(transformed_features).reshape(1,-1)
#     rainfall = round(prediction[0][0] , 2)
#     return rainfall
def getRainfallValue(year, month):
    try:
        column_names_rainfall_model = ['SUBDIVISION', 'YEAR', 'MONTH']
        features = [["Madhya Maharashtra", year, month]]
        features_df = pd.DataFrame(features, columns=column_names_rainfall_model)
        transformed_features = rainfall_preprocessor.transform(features_df)
        prediction = rainfall_model.predict(transformed_features).reshape(1, -1)
        rainfall = round(prediction[0][0], 2)
        return rainfall
    except Exception as e:
        print(f"Error processing rainfall data for year {year}, month {month}: {e}")
        return None


# market price
# def marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall):
#     column_names = ['District', 'Market', 'Commodity', 'Year', 'Month','Rainfall']
#     features = [[District, Market, Commodity, Year, Month, Rainfall]]
#     features_df = pd.DataFrame(features, columns=column_names)
#     transformed_features = market_price_preprocessor.transform(features_df)
#     prediction = market_price_model.predict(transformed_features).reshape(1,-1)
#     predicted_market_price = round(prediction[0][0] , 2)
#     return predicted_market_price
def marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall):
    try:
        column_names = ['District', 'Market', 'Commodity', 'Year', 'Month', 'Rainfall']
        features = [[District, Market, Commodity, Year, Month, Rainfall]]
        features_df = pd.DataFrame(features, columns=column_names)
        transformed_features = market_price_preprocessor.transform(features_df)
        prediction = market_price_model.predict(transformed_features).reshape(1, -1)
        predicted_market_price = round(prediction[0][0], 2)
        return predicted_market_price
    except Exception as e:
        print(f"Error predicting market price for {Commodity} in {Market}, {District} for {Year}-{Month}: {e}")
        return None


# market data district wise
# def marketPriceSeries(District, Commodity, Year, Month):
#     markets = markets_data.get(District, [])
#     marketPriceData = {}
#     Rainfall = getMahaAnnualRainfall(Year, District)
#     for Market in markets:
#         marketPrice = marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall)
#         marketPriceData[Market] = marketPrice
#     return marketPriceData
def marketPriceSeries(District, Commodity, Year, Month):
    try:
        markets = markets_data.get(District, [])
        marketPriceData = {}
        Rainfall = getMahaAnnualRainfall(Year, District)
        for Market in markets:
            marketPrice = marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall)
            marketPriceData[Market] = marketPrice
        return marketPriceData
    except Exception as e:
        print(f"Error generating market price series for {Commodity} in {District} for {Year}-{Month}: {e}")
        return {}


# market data of all district
# def getAllMarketPrice(Commodity, Year, Month):
#     marketPriceData = {}
#     for District in markets_data:
#         Rainfall = getMahaAnnualRainfall(Year, District)
#         markets = markets_data.get(District, [])
#         districtMarketData = {}
#         for Market in markets:
#             marketPrice = marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall)
#             districtMarketData[Market] = marketPrice 
#         marketPriceData[District] = districtMarketData
#     return marketPriceData
def getMarketPriceData(Commodity, Year, Month):
    try:
        marketPriceData = {}
        
        for District in markets_data:
            Rainfall = getMahaAnnualRainfall(Year, District)
            markets = markets_data.get(District, [])
            districtMarketData = {}
            
            for Market in markets:
                marketPrice = marketPricePrediction(District, Market, Commodity, Year, Month, Rainfall)
                districtMarketData[Market] = marketPrice
            
            marketPriceData[District] = districtMarketData
            
        return marketPriceData
    except Exception as e:
        print(f"Error generating market price data for {Commodity} in {Year}-{Month}: {e}")
        return {}


# wpi prediction
# def wpiPrediction(Commodity, Month, Year, Rainfall):
#     column_names = ['Commodity','Month','Year','Rainfall']
#     features = [[Commodity, Month, Year, Rainfall]]
#     features_df = pd.DataFrame(features, columns=column_names)
#     transformed_features = wpi_preprocessor.transform(features_df)
#     prediction = wpi_model.predict(transformed_features).reshape(1,-1)
#     predicted_wpi = round(prediction[0][0] , 2)
#     return predicted_wpi
def wpiPrediction(Commodity, Month, Year, Rainfall):
    try:
        column_names = ['Commodity', 'Month', 'Year', 'Rainfall']
        features = [[Commodity, Month, Year, Rainfall]]
        features_df = pd.DataFrame(features, columns=column_names)
        transformed_features = wpi_preprocessor.transform(features_df)
        prediction = wpi_model.predict(transformed_features).reshape(1, -1)
        predicted_wpi = round(prediction[0][0], 2)
        return predicted_wpi
    except Exception as e:
        print(f"Error predicting WPI for {Commodity} in {Month}/{Year}: {e}")
        return None


# wpi price calculation
# def wpiPricePrediction(Commodity, Month, Year, Rainfall):
#     wpi = wpiPrediction(Commodity, Month, Year, Rainfall)
#     commodity_avg_price = commodity_price[Commodity]['avg_price']
#     commodity_msp_price = commodity_price[Commodity]['msp_price']
#     min_wpi_price = round((wpi*commodity_avg_price)/100,2)
#     max_wpi_price = round((wpi*commodity_msp_price)/100,2)
#     avg_wpi_price = round((min_wpi_price + max_wpi_price) / 2,2)
#     return min_wpi_price,max_wpi_price,avg_wpi_price
def wpiPricePrediction(Commodity, Month, Year, Rainfall):
    try:
        wpi = wpiPrediction(Commodity, Month, Year, Rainfall)
        commodity_avg_price = commodity_price[Commodity]['avg_price']
        commodity_msp_price = commodity_price[Commodity]['msp_price']
        min_wpi_price = round((wpi * commodity_avg_price) / 100, 2)
        max_wpi_price = round((wpi * commodity_msp_price) / 100, 2)
        avg_wpi_price = round((min_wpi_price + max_wpi_price) / 2, 2)
        return min_wpi_price, max_wpi_price, avg_wpi_price
    except KeyError as e:
        print(f"Error: Missing data for {Commodity} in commodity_price dictionary: {e}")
        return None, None, None
    except Exception as e:
        print(f"Error predicting WPI prices for {Commodity} in {Month}/{Year}: {e}")
        return None, None, None

# for whole year
# def wpiPriceWholeYear(Commodity,Year):
#     min_price_data = []
#     msp_data = []
#     Month = 1 
#     rainfallData = getRainfallDataYearSeries(Year)
#     x_count =0 
#     for rainfall in rainfallData:
#         min_wpi_price,max_wpi_price,avg_wpi_price = wpiPricePrediction(Commodity,Month,Year,rainfall)
#         msp_data.append(max_wpi_price)
#         min_price_data.append(min_wpi_price)
#         Month = Month + 1
#         x_count = x_count + 1
#     return min_price_data,msp_data
def wpiPriceWholeYear(Commodity, Year):
    try:
        min_price_data = []
        msp_data = []
        Month = 1
        rainfallData = getRainfallDataYearSeries(Year)
        x_count = 0
        for rainfall in rainfallData:
            min_wpi_price, max_wpi_price, avg_wpi_price = wpiPricePrediction(Commodity, Month, Year, rainfall)
            msp_data.append(max_wpi_price)
            min_price_data.append(min_wpi_price)
            Month = Month + 1
            x_count = x_count + 1
        return min_price_data, msp_data
    except Exception as e:
        print(f"Error predicting WPI prices for {Commodity} in {Year}: {e}")
        return [], []


# get coordinates
def get_coordinates(subdistrict, district):
    district = district.lower()
    subdistrict = get_subdistrict(subdistrict)
    subdistrict = subdistrict.lower()
    query = f"{subdistrict}, {district}, maharashtra"
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
# def calculate_osrm_distance(source_coords, destination_coords):
#     url = f"http://router.project-osrm.org/route/v1/driving/{source_coords['lon']},{source_coords['lat']};{destination_coords['lon']},{destination_coords['lat']}?overview=false"
#     response = requests.get(url)
#     data = response.json()
#     if data.get("routes"):
#         distance = data["routes"][0]["legs"][0]["distance"] / 1000 
#         duration = data["routes"][0]["legs"][0]["duration"] / 60 
#         return {"distance": distance, "duration": duration}
#     return None

def calculate_osrm_distance(source_coords, destination_coords):
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{source_coords['lon']},{source_coords['lat']};{destination_coords['lon']},{destination_coords['lat']}?overview=false"
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return None
        
        data = response.json()
        if data.get("routes"):
            distance = data["routes"][0]["legs"][0]["distance"] / 1000  # distance in km
            duration = data["routes"][0]["legs"][0]["duration"] / 60  # duration in minutes
            return {"distance": distance, "duration": duration}
        
        print("Error: No route found in the response.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error making the request: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None


# Function to fetch fuel prices
# def fetch_fuel_prices(district):
#     district = district.lower()
#     url = f"https://daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com/v1/fuel-prices/today/india/maharashtra/{district}"
#     headers = {
#         "x-rapidapi-key": DAILY_FULE_DATA_KEY,
#         "x-rapidapi-host": "daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com",
#     }
#     response = requests.get(url, headers=headers)
#     return response.json()

def get_fuel_prices_for_district(district):
    try:
        district = district.lower()
        url = f"https://daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com/v1/fuel-prices/today/india/maharashtra/{district}"
        headers = {
            "x-rapidapi-key": DAILY_FUEL_DATA_KEY,
            "x-rapidapi-host": "daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com",
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return None
        
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making the request: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None


# trasportation cost
# def calculateTransportationDistance(coords_source,fuel_prices,des_district,mileage):
#     subdistricts = markets_data[des_district]
#     transportation_data_all = {}
#     transportation_data = {}
#     for des_subdistrict in subdistricts:
#         with concurrent.futures.ThreadPoolExecutor() as executor:
#             future_coords_destination = executor.submit(get_coordinates, des_subdistrict,des_district)
#             coords_destination = future_coords_destination.result()
            
#         if coords_source and coords_destination:
#             distance_result = calculate_osrm_distance(coords_source, coords_destination)
#             if distance_result:
#                 transportation_cost = (distance_result["distance"] / mileage) * fuel_prices["fuel"]["diesel"]["retailPrice"]
#                 data = {
#                     "distance": round(distance_result["distance"], 2),  
#                     "duration": round(distance_result["duration"], 2),  
#                     "transportation_cost": round(transportation_cost, 2),  
#                     "fuel_prices": round(fuel_prices["fuel"]["diesel"]["retailPrice"], 2) 
#                 }
#             transportation_data[des_subdistrict] = data
#             transportation_data_all[des_subdistrict] = data
#         else :
#             data = {
#                     "distance":'N/A',  
#                     "duration": 'N/A', 
#                     "transportation_cost": 'N/A', 
#                     "fuel_prices": 'N/A'
#                 }
#             transportation_data_all[des_subdistrict] = data
            
#     return transportation_data_all,transportation_data
import concurrent.futures

def calculateTransportationDistance(coords_source, fuel_prices, des_district, mileage):
    transportation_data_all = {}
    transportation_data = {}
    
    try:
        subdistricts = markets_data.get(des_district, [])
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {}
            # Submit tasks for getting coordinates for all subdistricts
            for des_subdistrict in subdistricts:
                future_coords_destination = executor.submit(get_coordinates, des_subdistrict, des_district)
                futures[des_subdistrict] = future_coords_destination
        
            # Process the results
            for des_subdistrict, future_coords_destination in futures.items():
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
                    else:
                        data = {
                            "distance": 'N/A',
                            "duration": 'N/A',
                            "transportation_cost": 'N/A',
                            "fuel_prices": 'N/A'
                        }
                else:
                    data = {
                        "distance": 'N/A',
                        "duration": 'N/A',
                        "transportation_cost": 'N/A',
                        "fuel_prices": 'N/A'
                    }

                transportation_data[des_subdistrict] = data
                transportation_data_all[des_subdistrict] = data
        
    except Exception as e:
        print(f"Error calculating transportation distance: {e}")
        return {}, {}

    return transportation_data_all, transportation_data


# trasportation cost for all markets
# def getTransportationData(src_subdistrict,src_district,des_district,milage):
#     with concurrent.futures.ThreadPoolExecutor() as executor:
#         future_coords_source = executor.submit(get_coordinates, src_subdistrict,src_district)
#         future_fuel_prices = executor.submit(get_fuel_prices_for_district, src_district)
#         coords_source = future_coords_source.result()
#         fuel_prices = future_fuel_prices.result()
        
#     transportation_data_all,transportation_data = calculateTransportationDistance(coords_source,fuel_prices,des_district,milage)
#     # print(transportation_data_all)
#     return transportation_data_all,transportation_data
import concurrent.futures

def getTransportationData(src_subdistrict, src_district, des_district, mileage):
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_coords_source = executor.submit(get_coordinates, src_subdistrict, src_district)
            future_fuel_prices = executor.submit(get_fuel_prices_for_district, src_district)
            
            coords_source = future_coords_source.result()
            fuel_prices = future_fuel_prices.result()
        
        if coords_source and fuel_prices:
            transportation_data_all, transportation_data = calculateTransportationDistance(coords_source, fuel_prices, des_district, mileage)
        else:
            print("Error: Coordinates or fuel prices could not be fetched.")
            return {}, {}

    except concurrent.futures.TimeoutError:
        print("Error: Request timed out while fetching data.")
        return {}, {}
    except Exception as e:
        print(f"Error calculating transportation data: {e}")
        return {}, {}

    return transportation_data_all, transportation_data


##### Routes 


@app.route('/')
def index():
    return ("Server running on localhost:5000")

# @app.route('/intel-market-price',methods=['POST'])
# def marketPrice():
#     if request.method == 'POST':
#         data = request.get_json()
#         Commodity = data.get('commodity')
#         Year = data.get('year')
#         Month = data.get('month')
#         srcSubdistrict = data.get('srcSubdistrict')
#         srcDistrict = data.get('srcDistrict')
#         desDistrict = data.get('desDistrict')
#         milage  = data.get('milage')
        
#         Year = int(Year)
#         Month = int(Month)
#         milage = int(milage)
       
#         marketPriceData = marketPriceSeries(desDistrict, Commodity, Year, Month)
#         # print(marketPriceData)
#         transportation_data_all,transportation_data = getTransportationData(srcSubdistrict,srcDistrict,desDistrict,milage)
#         # print(transportation_data)
#         conclusion = getMarketSelectionConclusion(marketPriceData,transportation_data,srcDistrict)
#         # print(conclusion)
#         return jsonify({'data':marketPriceData,'transportationData':transportation_data_all,'conclusion':conclusion})
from flask import Flask, request, jsonify

@app.route('/intel-market-price', methods=['POST'])
def marketPrice():
    if request.method == 'POST':
        try:
            # Parse incoming JSON data
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['commodity', 'year', 'month', 'srcSubdistrict', 'srcDistrict', 'desDistrict', 'milage']
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            # Extract values from data
            Commodity = data.get('commodity')
            Year = int(data.get('year'))
            Month = int(data.get('month'))
            srcSubdistrict = data.get('srcSubdistrict')
            srcDistrict = data.get('srcDistrict')
            desDistrict = data.get('desDistrict')
            milage = int(data.get('milage'))
            
            # Get market price data
            marketPriceData = marketPriceSeries(desDistrict, Commodity, Year, Month)
            if not marketPriceData:
                return jsonify({"error": "Failed to get market price data"}), 500
            
            # Get transportation data
            transportation_data_all, transportation_data = getTransportationData(srcSubdistrict, srcDistrict, desDistrict, milage)
            if not transportation_data_all or not transportation_data:
                return jsonify({"error": "Failed to get transportation data"}), 500
            
            # Get conclusion
            conclusion = getMarketSelectionConclusion(marketPriceData, transportation_data, srcDistrict)
            if not conclusion:
                return jsonify({"error": "Failed to generate market selection conclusion"}), 500
            
            # Return the response
            return jsonify({
                'data': marketPriceData,
                'transportationData': transportation_data_all,
                'conclusion': conclusion
            })

        except Exception as e:
            # Handle unexpected errors
            return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# @app.route('/intel-wpi-price',methods=['POST'])
# def IntelWPI():
#     if request.method == 'POST':
#         data = request.get_json()
#         Commodity = data.get('commodity')
#         Year = data.get('year')
#         Month = data.get('month')
        
#         Year = int(Year)
#         Month = int(Month)
        
#         Rainfall = getIndiaRainfallMonthly(Year,Month)
        
#         avgPrice,minPrice,maxPrice = wpiPricePrediction(Commodity,Month,Year,Rainfall)
        
#         minPriceCurrSeries,maxPriceCurrSeries = wpiPriceWholeYear(Commodity,Year)
#         minPriceNextSeries,maxPriceNextSeries = wpiPriceWholeYear(Commodity,Year+1)
        
#         maxMSPPrice = max(maxPriceCurrSeries)
#         maxAvgPrice = max(minPriceCurrSeries)
#         minMSPPrice = min(maxPriceCurrSeries)
#         minAvgPrice = min(minPriceCurrSeries)

#         goldMonthIndex = maxPriceCurrSeries.index(maxMSPPrice) + 1
#         silverMonthIndex = maxPriceCurrSeries.index(minMSPPrice) + 1
        
#         return jsonify({
#             'rainfall':Rainfall,
#             'commodity':Commodity,
#             'year':Year,
#             'month':Month,
#             'avgPrice':avgPrice,
#             'minPrice':minPrice,
#             'maxPrice':maxPrice,
#             'minPriceCurrSeries':minPriceCurrSeries,
#             'maxPriceCurrSeries':maxPriceCurrSeries,
#             'minPriceNextSeries':minPriceNextSeries,
#             'maxPriceNextSeries':maxPriceNextSeries,
#             'maxMSPPrice':maxMSPPrice,
#             'maxAvgPrice':maxAvgPrice,
#             'minMSPPrice':minMSPPrice,
#             'minAvgPrice':minAvgPrice,
#             'goldMonthIndex':goldMonthIndex,
#             'silverMonthIndex':silverMonthIndex,
#         })

@app.route('/intel-wpi-price', methods=['POST'])
def IntelWPI():
    if request.method == 'POST':
        try:
            # Parse incoming JSON data
            data = request.get_json()

            # Validate required fields
            required_fields = ['commodity', 'year', 'month']
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            # Extract values from data
            Commodity = data.get('commodity')
            Year = int(data.get('year'))
            Month = int(data.get('month'))

            # Get rainfall data
            Rainfall = getIndiaRainfallMonthly(Year, Month)
            if not Rainfall:
                return jsonify({"error": "Failed to get rainfall data"}), 500

            # Get WPI price prediction
            avgPrice, minPrice, maxPrice = wpiPricePrediction(Commodity, Month, Year, Rainfall)
            if avgPrice is None or minPrice is None or maxPrice is None:
                return jsonify({"error": "Failed to predict WPI prices"}), 500

            # Get WPI price series for current and next year
            minPriceCurrSeries, maxPriceCurrSeries = wpiPriceWholeYear(Commodity, Year)
            minPriceNextSeries, maxPriceNextSeries = wpiPriceWholeYear(Commodity, Year + 1)

            # Calculate max and min prices
            maxMSPPrice = max(maxPriceCurrSeries)
            maxAvgPrice = max(minPriceCurrSeries)
            minMSPPrice = min(maxPriceCurrSeries)
            minAvgPrice = min(minPriceCurrSeries)

            # Find gold and silver month indexes
            goldMonthIndex = maxPriceCurrSeries.index(maxMSPPrice) + 1
            silverMonthIndex = maxPriceCurrSeries.index(minMSPPrice) + 1

            # Return the response
            return jsonify({
                'rainfall': Rainfall,
                'commodity': Commodity,
                'year': Year,
                'month': Month,
                'avgPrice': avgPrice,
                'minPrice': minPrice,
                'maxPrice': maxPrice,
                'minPriceCurrSeries': minPriceCurrSeries,
                'maxPriceCurrSeries': maxPriceCurrSeries,
                'minPriceNextSeries': minPriceNextSeries,
                'maxPriceNextSeries': maxPriceNextSeries,
                'maxMSPPrice': maxMSPPrice,
                'maxAvgPrice': maxAvgPrice,
                'minMSPPrice': minMSPPrice,
                'minAvgPrice': minAvgPrice,
                'goldMonthIndex': goldMonthIndex,
                'silverMonthIndex': silverMonthIndex,
            })

        except Exception as e:
            # Handle unexpected errors
            return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


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
        print(Rainfall)
        govMarketPrice = wpiPricePrediction(Commodity,Month,Year,Rainfall)

        marketPriceData = getMarketPriceData(Commodity,Year,Month)
      
        highestLocalMarketPrice = -1 
        localMarketName = None
        districtName = None

        for district, market_data in marketPriceData.items():
            for market, price in market_data.items():
                if price > highestLocalMarketPrice:
                    highestLocalMarketPrice = price
                    localMarketName = market
                    districtName = district

        decision = getSellingDecision(Commodity,highestLocalMarketPrice,localMarketName,districtName,govMarketPrice,storageAvailability)
        
        return jsonify({
                        'decision':decision,
                        'govMarketPrice':govMarketPrice,
                        'highestLocalMarketPrice':highestLocalMarketPrice,
                        'localMarketName':localMarketName,
                        'districtName':districtName})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
