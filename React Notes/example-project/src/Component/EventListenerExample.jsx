

import React, { useEffect, useRef } from 'react';

const EventListenerExample = () => {
    const divRef = useRef();

    useEffect(() => {
        const handleScroll = () => {
            console.log('Window scrolled');
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up function
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    return <div ref={divRef}>Scroll the window</div>;
};

export default EventListenerExample;