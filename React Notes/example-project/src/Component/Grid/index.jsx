import { useMemo, useState } from "react";
import Child from "./Child";
const SIZE = 10; // Change this to 1000 for a 1000x1000 grid

const GridComponent = () => {
    const [count, setCount] = useState(0);

    function handleCountChange(newCount) {
        setCount(count + newCount);
    }
    const cells = Array.from({ length: SIZE }, (arr, i) => (
        <div key={i} style={{ display: "flex" }}>
            {Array.from({ length: SIZE }, (ele, j) => (
                <Child key={j} i={i} j={j} handleCountChange={handleCountChange} />
            ))}
        </div>
    ));

    return (
        <>
            <h1>Grids</h1>
            <p>Selected cells - {count}</p>
            {cells}
        </>
    );
};

export default GridComponent;
