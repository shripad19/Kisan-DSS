import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const UserTransactions = () => {
    const [userId, setUserId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    // Fetch User ID from Token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem("token");
                navigate("/login/user");
            }
        } else {
            navigate("/login/user");
        }
    }, [navigate]);

    // Fetch Transactions when userId is set
    useEffect(() => {
        if (userId) {
            fetchTransactions();
        }
    }, [userId]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/users/${userId}/transactions`);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border">Crop Name</th>
                            <th className="py-2 px-4 border">Quantity</th>
                            <th className="py-2 px-4 border">Amount Paid</th>
                            <th className="py-2 px-4 border">Transaction Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((txn, index) => (
                                <tr key={index} className="text-center border">
                                    <td className="py-2 px-4 border">{txn.cropname}</td>
                                    <td className="py-2 px-4 border">{txn.quantity}</td>
                                    <td className="py-2 px-4 border">{txn.amount_paid} Rs.</td>
                                    <td className="py-2 px-4 border">
                                    {txn.transaction_date}
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

export default UserTransactions;
