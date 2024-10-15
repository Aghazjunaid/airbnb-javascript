import React, { useState } from "react";

const Child = ({ i, j, handleCountChange }) => {
    console.log(i, j);
    const [selected, setSelected] = useState(false);

    const handleClick = () => {
        setSelected((prevSelected) => {
            const newSelected = !prevSelected;
            handleCountChange(newSelected ? 1 : -1);
            return newSelected;
        });
    };
    
    return (
        <>
            <div
                style={{
                    height: "20px",
                    width: "20px",
                    border: "1px solid black",
                    backgroundColor: selected ? "red" : "white",
                }}
                onClick={handleClick}
            ></div>
        </>
    );
};

export default React.memo(Child);
