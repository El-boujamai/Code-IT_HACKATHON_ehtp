import React from 'react';
import { Box, Text } from '@react-three/drei';

function ArrayVisualization({ array, position }) {
  return (
    <group position={position}>
      {array.elements.map((element, index) => (
        <group key={index} position={[index * 1.2, 0, 0]}>
          <Box args={[1, 1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="orange" />
          </Box>
          <Text 
            position={[0, 0, 0.6]} 
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {element}
          </Text>
        </group>
      ))}
      <Text 
        position={[(array.elements.length - 1) * 0.6, -1.5, 0]} 
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        {array.name} [length: {array.elements.length}]
      </Text>
    </group>
  );
}

export default ArrayVisualization;