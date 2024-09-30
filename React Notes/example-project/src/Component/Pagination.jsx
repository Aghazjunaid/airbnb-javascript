

import {useState, useEffect,Profiler} from 'react';

const Pagination = () => {
    const [data, setData] = useState(Array.from({length:100}).map((ele,i) => `Item ${i+1}`));
    const [currentData, setCurrentData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        setCurrentData(data.slice(0,limit))
        setTotalPage(Math.ceil(data.length/limit))
    },[limit])

    function nextClick(){
        if(currentPage < totalPage){
            setCurrentPage(currentPage + 1);
            setCurrentData(data.slice(currentPage*limit,(currentPage+1)*limit))
        }
    }

    function prevClick(){
        setCurrentPage(currentPage - 1);
        setCurrentData(data.slice((currentPage-2)*limit,(currentPage-1)*limit))
    }
    const handleRender = (id, phase, actualDuration) => {
        console.log({ id, phase, actualDuration });
      };

    return(
        <Profiler id="App" onRender={handleRender}>
            <div>Pagination Tutorial</div>
            {currentData.length > 0 && currentData.map((ele,i) => {
                return (
                    <div key={i}>
                        <p>{ele}</p>
                    </div>
                )
            })}
            <button onClick={nextClick} disabled={currentPage === totalPage} > Next </button>
            <select value={limit} onChange={(e) => setLimit(e.target.value)}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
            </select>
            <button onClick={prevClick} disabled={currentPage === 1}> Previous </button>
            <div>Total : {data.length}</div>
            <div>current page: {currentPage}</div>
            <div>Total page: {totalPage}</div>
        
      </Profiler>
    )
}

export default Pagination;