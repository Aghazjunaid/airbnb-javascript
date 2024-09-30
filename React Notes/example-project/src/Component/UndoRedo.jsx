

import { useState } from "react";


const UndoRedo = ()=>{
    const [state, setState] = useState(null);
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);

    const undo = () => {
        if(history.length > 0){
            setFuture([...future, state]);
            setState(history[history.length - 1]);
            setHistory(history.slice(0, history.length - 1));   
        }
    }

    const redo = () => {
        if(future.length > 0){
            setState(future[future.length - 1]);
            setFuture(future.slice(0, future.length - 1));
            setHistory([...history, state]);
        }
    }

    const set = () => {
        if(state){
            setHistory([...history, state]);
        }
        setState(Math.floor(Math.random()*1000));
    }
    return (<>
        <h1>{state}</h1>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={set}>click me</button>
    </>)
}

export default UndoRedo;