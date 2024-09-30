

const Debounce = () => {

    function debounce(cb,delay){
        let timer = null;
        return function(){
            if(timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                cb(...arguments)
            },delay)
        }
    }

    const change = debounce((e)=> {
        console.log(e.target.value)
    },2000)

    return (
        <div>
            <h1>Debounce</h1>
            <input type='text' onChange={change}/>
        </div>
    )
}

export default Debounce;