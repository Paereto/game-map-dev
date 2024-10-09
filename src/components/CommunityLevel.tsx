import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapContext } from '../context/MapContext'

const Building = ({ position, type }: { position: [number, number, number], type: string }) => {
  const color = type === 'residential' ? 'yellow' : type === 'commercial' ? 'blue' : 'red'
  const height = type === 'residential' ? 2 : type === 'commercial' ? 3 : 4

  return (
    <mesh position={position}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const Road = ({ start, end }: { start: [number, number], end: [number, number] }) => {
  const points = [new THREE.Vector3(start[0], 0.1, start[1]), new THREE.Vector3(end[0], 0.1, end[1])]
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="gray" linewidth={2} />
    </line>
  )
}

const City = () => {
  const [buildings, setBuildings] = useState<{ position: [number, number, number], type: string }[]>([])
  const { updateCommunity } = useMapContext()

  const addBuilding = (x: number, z: number) => {
    const type = Math.random() > 0.6 ? 'residential' : Math.random() > 0.3 ? 'commercial' : 'industrial'
    const newBuildings = [...buildings, { position: [x, 1, z], type }]
    setBuildings(newBuildings)
    updateCommunity('city1', { buildings: newBuildings.length, population: newBuildings.length * 10 })
  }

  return (
    <group onClick={(e) => {
      e.stopPropagation()
      if (e.object.type === 'Mesh' && e.object.name === 'ground') {
        const { x, z } = e.point
        addBuilding(Math.round(x), Math.round(z))
      }
    }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} name="ground">
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#8a8a8a" />
      </mesh>
      {buildings.map((building, index) => (
        <Building key={index} position={building.position} type={building.type} />
      ))}
      <Road start={[-25, -25]} end={[25, -25]} />
      <Road start={[-25, 0]} end={[25, 0]} />
      <Road start={[-25, 25]} end={[25, 25]} />
      <Road start={[-25, -25]} end={[-25, 25]} />
      <Road start={[0, -25]} end={[0, 25]} />
      <Road start={[25, -25]} end={[25, 25]} />
    </group>
  )
}

const CommunityInfo = () => {
  const { state } = useMapContext()
  const cityData = state.community['city1'] || { buildings: 0, population: 0 }
  return (
    <Html position={[-24, 5, -24]}>
      <div className="bg-white p-2 rounded shadow">
        <h3 className="font-bold">Community Info</h3>
        <p>Buildings: {cityData.buildings}</p>
        <p>Population: {cityData.population}</p>
      </div>
    </Html>
  )
}

const BuildMenu = () => (
  <Html position={[24, 5, -24]}>
    <div className="bg-white p-2 rounded shadow">
      <h3 className="font-bold">Build Menu</h3>
      <button className="bg-yellow-500 p-1 m-1 rounded">🏠 House</button>
      <button className="bg-blue-500 p-1 m-1 rounded">🏪 Shop</button>
      <button className="bg-red-500 p-1 m-1 rounded">🏭 Factory</button>
    </div>
  </Html>
)

const CommunityLevel: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 20, 20], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <City />
        <CommunityInfo />
        <BuildMenu />
        <OrbitControls 
          minDistance={5} 
          maxDistance={50}
          maxPolarAngle={Math.PI / 3}
        />
        <Text
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={2}
          color="white"
        >
          Community Level (1km² to 50km²)
        </Text>
      </Canvas>
    </div>
  )
}

export default CommunityLevel