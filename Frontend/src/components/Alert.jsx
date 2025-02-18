import React from "react";
import "../css/Alert.css";
function AlertSuccess() {
    return (
        <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossOrigin="anonymous"></link>
            <div className="alert alert-success successAlert" role="alert" >
                Data submitted successfully!!
            </div>
        </>
    );
}

function AlertWarning() {
    return (
        <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossOrigin="anonymous"></link>
            <div className="alert alert-warning successAlert" role="alert">
                A simple warning alert—check it out!
            </div>
        </>
    );
}
export {
    AlertSuccess, AlertWarning
}