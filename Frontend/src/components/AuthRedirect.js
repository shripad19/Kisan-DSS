import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if user is not authenticated
    }
  }, [navigate]);

  return null; // This component does not render anything
};

export default AuthRedirect;
