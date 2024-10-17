import {useEffect, useState} from 'react';

const AutoComplete = () => {
    const [search,setSearch] = useState('');
    const [data,setData] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchData(){
        setLoading(true);
        try {
            const response = await fetch(`https://dummyjson.com/recipes/search?q=${search}`);
            const data = await response.json();
            setData(data.recipes || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if(search){
            fetchData()
        } else {
            setData([])
        }
    },[search])

    function debounce(cb,delay){
        let timer = null;
        return function(...arg){
            if(timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                cb(...arg)
            },delay)
        }
    }

    const handleChange = debounce((e)=> {
        setSearch(e.target.value)
    },1000)

    console.log(search,data);

    const highlight = (text, highlight) => {
        const parts = text.split(new RegExp(`(${highlight})`, "gi"));
        return (
            <span>
              {parts.map((part, index) => {
                return part.toLowerCase() === highlight.toLowerCase() ? (
                  <b key={index}>{part}</b>
                ) : (
                  part
                );
              })}
            </span>
          );
    }

    const handleSuggestionClick = (suggestion) => {
        setData(suggestion)
    }
    return (
        <>
            <input 
                type='text'
                // value={search}
                placeholder='search anything'
                onChange={handleChange}
            />
            {loading && <div>Loading...</div>}
            {data.length > 0 && (
                <ul style={{ border: '1px solid red', listStyle: 'none', padding: 0 }}>
                    {data.map((suggestion) => (
                        <li
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ cursor: 'pointer', padding: '5px' }}
                        >
                            {highlight(suggestion.name,search)}
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default AutoComplete;
