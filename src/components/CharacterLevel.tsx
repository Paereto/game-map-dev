import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapContext } from '../context/MapContext'

const Character = ({ position, setPosition }: { position: THREE.Vector3, setPosition: (pos: THREE.Vector3) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const targetPosition = useRef(new THREE.Vector3())
  const { updateCharacter } = useMapContext()

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.position.lerp(targetPosition.current, 0.1)
    setPosition(meshRef.current.position)
    updateCharacter('player1', { position: { x: meshRef.current.position.x, y: meshRef.current.position.y, z: meshRef.current.position.z } })
  })

  const handleMove = (e: THREE.Event) => {
    if (e.button !== 0) return // Only handle left click
    const intersects = (e as any).intersects
    if (intersects.length > 0) {
      targetPosition.current.copy(intersects[0].point)
      targetPosition.current.y = 0.5 // Keep character on the ground
    }
  }

  return (
    <mesh ref={meshRef} position={position} onClick={handleMove}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )
}

const Environment = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>
      {/* Add detailed buildings */}
      <mesh position={[5, 1.5, 5]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      <mesh position={[-5, 1, -5]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Add street furniture */}
      <mesh position={[2, 0.5, 2]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  )
}

const NPC = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

const CharacterInfo = () => {
  const { state } = useMapContext()
  const characterData = state.character['player1'] || { position: { x: 0, y: 0, z: 0 }, inventory: [] }
  return (
    <Html position={[-48, 5, -48]}>
      <div className="bg-white p-2 rounded shadow">
        <h3 className="font-bold">Character Info</h3>
        <p>Position: ({characterData.position.x.toFixed(2)}, {characterData.position.z.toFixed(2)})</p>
        <p>Inventory: {characterData.inventory.length} items</p>
      </div>
    </Html>
  )
}

const Notifications = () => (
  <Html position={[48, 5, -48]}>
    <div className="bg-white p-2 rounded shadow">
      <h3 className="font-bold">Notifications</h3>
      <p>Welcome to the city!</p>
    </div>
  </Html>
)

const CharacterLevel: React.FC = () => {
  const [characterPosition, setCharacterPosition] = useState(new THREE.Vector3(0, 0.5, 0))
  const { state, updateCharacter } = useMapContext()

  useEffect(() => {
    // Initialize the character if it doesn't exist
    if (!state.character['player1']) {
      updateCharacter('player1', {
        position: { x: 0, y: 0.5, z: 0 },
        inventory: []
      })
    }
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 10, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Environment />
        <Character position={characterPosition} setPosition={setCharacterPosition} />
        <NPC position={[3, 0.5, 3]} />
        <NPC position={[-3, 0.5, -3]} />
        <CharacterInfo />
        <Notifications />
        <OrbitControls 
          target={characterPosition}
          minDistance={5} 
          maxDistance={20}
          maxPolarAngle={Math.PI / 3}
        />
        <Text
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={2}
          color="white"
        >
          Character Level (100m² to 1km²)
        </Text>
      </Canvas>
    </div>
  )
}

export default CharacterLevel