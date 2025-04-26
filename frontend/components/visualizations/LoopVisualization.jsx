import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Line } from '@react-three/drei';

function LoopVisualization({ loop, position }) {
  const rotationRef = useRef();
  
  useFrame(({ clock }) => {
    if (rotationRef.current) {
      rotationRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });
  
  return (
    <group position={position}>
      <group ref={rotationRef}>
        <Line 
          points={[[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0], [-1, -1, 0]]} 
          color="cyan" 
          lineWidth={2}
        />
        <Box args={[0.5, 0.5, 0.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="blue" />
        </Box>
      </group>
      <Text 
        position={[0, -1.5, 0]} 
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        {loop.type} loop: {loop.variable}
      </Text>
    </group>
  );
}

export default LoopVisualization;