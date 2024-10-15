function App() {
  const parentFunction = () => {
    console.log('Hello from the parent');
  };
  const firstChildFunction = (event) => {
    event.stopPropagation();
    console.log('Hello from the first child');
  };
  const secondChildFunction = () => {
    console.log('Hello from the second child');
  };
  const thirdChildFunction = () => {
    console.log('Hello from the third child');
  };
  return ( 
    <div className="App">
      <div className="parent-div" onClick={parentFunction}>
        <button className="first-child-button" onClick={firstChildFunction}>
          First child button
        </button>
        <button className="second-child-button" onClick={secondChildFunction}>
          Second child button
        </button>
        <button className="third-child-button" onClick={thirdChildFunction}>
          Third child button
        </button>
      </div>
    </div>
  );
}
export default App;
