// components/SideEffectFix.jsx
import React, { useEffect, useState } from 'react';

const SideEffectFix = () => {
  const [data, setData] = useState(null);

  // Replace UNSAFE_componentWillMount with useEffect
  useEffect(() => {
    // Perform any side effects here
    fetchData();
  }, []);

  const fetchData = async () => {
    // Your data fetching logic here
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      {data ? (
        <div>Data loaded successfully</div>
      ) : (
        <div>Loading data...</div>
      )}
    </div>
  );
};

export default SideEffectFix;