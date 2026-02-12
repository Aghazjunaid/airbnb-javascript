1. //sleep function
2. when i click on parent component then child componenet should also triggered in react
import React, { useState, useEffect } from 'react';

function ChildComponent({ trigger }) {
  useEffect(() => {
    if (trigger) {
      console.log('Child component triggered');
    }
  }, [trigger]);

  return <div>Child Component</div>;
}

function ParentComponent() {
  const [trigger, setTrigger] = useState(false);

  const handleClick = () => {
    setTrigger(prevState => !prevState);
  };

  return (
    <div onClick={handleClick}>
      Parent Component
      <ChildComponent trigger={trigger} />
    </div>
  );
}

export default ParentComponent;

//or
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

const ChildComponent = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    triggerChild() {
      console.log('Child component triggered');
    }
  }));

  return <div>Child Component</div>;
});

function ParentComponent() {
  const childRef = useRef();

  const handleClick = () => {
    childRef.current.triggerChild();
  };

  return (
    <div onClick={handleClick}>
      Parent Component
      <ChildComponent ref={childRef} />
    </div>
  );
}

export default ParentComponent;


3. create 1000*1000 grids and every grids as a child component in react and when i click on those grids it's value will get chnaged and every time we should know how many grids got selected and optimise the rerenders
  import React, { useState, useMemo } from 'react';

const SIZE = 10; // Change this to 1000 for a 1000x1000 grid

const Cell = React.memo(({ selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: '20px',
      height: '20px',
      border: '1px solid black',
      backgroundColor: selected ? 'blue' : 'white',
    }}
  />
));

function Grid() {
  const [selected, setSelected] = useState(new Set());

  const handleClick = (i, j) => {
    const id = `${i}-${j}`;
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    setSelected(new Set(selected));
  };

  const cells = useMemo(() => Array.from({ length: SIZE }, (_, i) => (
    <div key={i} style={{ display: 'flex' }}>
      {Array.from({ length: SIZE }, (_, j) => (
        <Cell
          key={j}
          selected={selected.has(`${i}-${j}`)}
          onClick={() => handleClick(i, j)}
        />
      ))}
    </div>
  )), [selected]);

  return (
    <div>
      {cells}
      <p>{selected.size} cells selected</p>
    </div>
  );
}

export default Grid;


//12 feb 2026
1. Promise
2. map polyfill
3.
const xyz = ` mark     Johansson waffle    80 2
 mark   Johansson blender    200    1
    mark   Johansson knife    10 4
 Nikita    Smith waffle    80    2
      Nikita    Smith    blender    200 1
 Nikita    Smith knife 10 4 `;


// const obj = {
//     "mark Johansson": [
//         {  "name": "waffle",  "price": "80",  "quantity": "2"  },
//         {  "name": "blender",  "price": "200",  "quantity": "1"  },
//         {  "name": "knife",  "price": "10",  "quantity": "4"  }

//     ],
//     "Nikita Smith": [
//         {  "name": "waffle",  "price": "80",  "quantity": "2"  },
//         {  "name": "blender",  "price": "200",  "quantity": "1"  },
//         {  "name": "knife",  "price": "10",  "quantity": "4"  }
//     ]
// }

// [ 'mark', 'Johansson', 'waffle', '80', '2' ]
// [ 'mark', 'Johansson', 'blender', '200', '1' ]
// [ 'mark', 'Johansson', 'knife', '10', '4' ]
// [ 'Nikita', 'Smith', 'waffle', '80', '2' ]
// [ 'Nikita', 'Smith', 'blender', '200', '1' ]
// [ 'Nikita', 'Smith', 'knife', '10', '4' ]

let obj = {};
let modifiedXyz = xyz.split('\n');
let arr = [];

for(let i=0;i<modifiedXyz.length;i++){
    arr.push(modifiedXyz[i].split(' ').filter(Boolean))
}

for(let i=0;i<arr.length;i++){
    if(`${arr[i][0]} ${arr[i][1]}` in obj){
        obj[`${arr[i][0]} ${arr[i][1]}`].push({
            name : arr[i][2],
            price : arr[i][3],
            quanity : arr[i][4]
        })
    } else {
        obj[`${arr[i][0]} ${arr[i][1]}`] = [{
            name : arr[i][2],
            price : arr[i][3],
            quanity : arr[i][4]
        }]
    }
}

console.log(obj)


