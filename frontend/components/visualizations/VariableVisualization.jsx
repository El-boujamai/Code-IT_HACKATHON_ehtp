import React from 'react';
import { Box, Text } from '@react-three/drei';

function VariableVisualization({ variable, position }) {
  // Color based on type
  const getColor = () => {
    switch(variable.type) {
      case 'number': return 'blue';
      case 'string': return 'green';
      case 'boolean': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <group position={position}>
      <Box args={[1.5, 1, 0.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getColor()} />
      </Box>
      <Text 
        position={[0, 0.2, 0.3]} 
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {variable.name}
      </Text>
      <Text 
        position={[0, -0.2, 0.3]} 
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {variable.value}
      </Text>
    </group>
  );
}

export default VariableVisualization;