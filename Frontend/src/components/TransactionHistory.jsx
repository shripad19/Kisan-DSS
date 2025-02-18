import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const TransactionHistory = () => {
    const [farmerId, setFarmerId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    // Fetch Farmer ID from Token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded Farmer ID:", decoded.userId);
                setFarmerId(decoded.userId);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem("token");
                navigate("/login/farmer");
            }
        } else {
            navigate("/login/farmer");
        }
    }, [navigate]);

    // Fetch Transactions when Farmer ID is set
    useEffect(() => {
        if (farmerId) {
            const fetchTransactions = async () => {
                try {
                    const response = await fetch(`http://localhost:4000/api/farmers/${farmerId}/transactions`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    setTransactions(data.transactions);
                } catch (error) {
                    console.error("Error fetching transactions:", error);
                }
            };
            fetchTransactions();
        }
    }, [farmerId]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border">Crop Name</th>
                            <th className="py-2 px-4 border">Quantity Bought</th>
                            <th className="py-2 px-4 border">Coins Earned</th>
                            <th className="py-2 px-4 border">Transaction Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((txn, index) => (
                                <tr key={index} className="text-center border">
                                    <td className="py-2 px-4 border">{txn.cropName}</td>
                                    <td className="py-2 px-4 border">{txn.quantityBought}</td>
                                    <td className="py-2 px-4 border">{txn.coinsEarned}</td>
                                    <td className="py-2 px-4 border">
                                    {txn.transactionDate}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-4 text-center text-gray-500">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;
