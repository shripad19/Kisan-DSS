import { useState } from "react";

import LoginFarmer from "./LoginFarmer";
import SignupFarmer from "./SignupFarmer";

import LoginUser from "./LoginUser";
import SignupUser from "./SignupUser";

const AuthComponentUser = ({isClose}) => {
    const [isLogin, setIsLogin] = useState(true);
    return (
        <div>
            {isLogin ? (
                <LoginUser setIsLogin={setIsLogin} />
            ) : (
                <SignupUser setIsLogin={setIsLogin} />
            )}
        </div>
    );
};

const AuthComponentFarmer = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            {isLogin ? (
                <LoginFarmer setIsLogin={setIsLogin} />
            ) : (
                <SignupFarmer setIsLogin={setIsLogin} />
            )}
        </div>
    );
};

export default{ AuthComponentUser,AuthComponentFarmer};
