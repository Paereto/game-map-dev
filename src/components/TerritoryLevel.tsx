import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'

const noise2D = createNoise2D()

const BCTerrain: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null!)
  
  const { geometry, colorArray } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 200, 200)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const pa = pos.array as Float32Array
    const hMax = 20 // Maximum height
    const hMin = -2 // Minimum height (for lakes)
    
    // Generate base terrain
    for (let i = 0; i < pa.length; i += 3) {
      const x = pa[i] / 100
      const y = pa[i + 1] / 100
      
      let h = noise2D(x * 0.5, y * 0.5) * 0.7 + 0.3 // Large features
      h += noise2D(x * 2, y * 2) * 0.2 // Medium details
      h += noise2D(x * 8, y * 8) * 0.1 // Fine details
      
      // Smooth out the terrain
      h = Math.pow(h, 1.5)
      
      // Scale height
      h = hMin + (hMax - hMin) * h
      
      pa[i + 2] = h
    }

    // Generate rivers
    const riverPaths = generateRivers(pa, 200, 200)

    // Color the terrain
    for (let i = 0; i < pa.length; i += 3) {
      const x = pa[i] / 100
      const y = pa[i + 1] / 100
      const h = pa[i + 2]
      const colorIndex = i

      // Check if the point is part of a river
      const isRiver = riverPaths.some(path => 
        path.some(point => Math.abs(point[0] - x) < 0.005 && Math.abs(point[1] - y) < 0.005)
      )

      if (isRiver || h <= 0) {
        // Water (rivers and lakes)
        colors[colorIndex] = 0.1
        colors[colorIndex + 1] = 0.4
        colors[colorIndex + 2] = 0.8
      } else if (h < 2) {
        // Beach
        colors[colorIndex] = 0.76
        colors[colorIndex + 1] = 0.7
        colors[colorIndex + 2] = 0.5
      } else if (h < 8) {
        // Forest
        const t = (h - 2) / 6
        colors[colorIndex] = 0.1 + t * 0.1
        colors[colorIndex + 1] = 0.4 + t * 0.1
        colors[colorIndex + 2] = 0.1 + t * 0.1
      } else if (h < 15) {
        // Mountain
        const t = (h - 8) / 7
        colors[colorIndex] = 0.4 + t * 0.3
        colors[colorIndex + 1] = 0.4 + t * 0.3
        colors[colorIndex + 2] = 0.4 + t * 0.3
      } else {
        // Snow
        const t = Math.min((h - 15) / 5, 1)
        colors[colorIndex] = 0.8 + t * 0.2
        colors[colorIndex + 1] = 0.8 + t * 0.2
        colors[colorIndex + 2] = 0.9 + t * 0.1
      }
    }
    
    geo.computeVertexNormals()
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return { geometry: geo, colorArray: colors }
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    mesh.current.rotation.z = Math.sin(time * 0.1) * 0.02
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial 
        vertexColors={true}
        flatShading={false}
      />
    </mesh>
  )
}

function generateRivers(heightMap: Float32Array, width: number, height: number) {
  const rivers: [number, number][][] = []
  const numRivers = 5
  const minRiverLength = 20

  for (let i = 0; i < numRivers; i++) {
    let x = Math.floor(Math.random() * width)
    let y = Math.floor(Math.random() * height)
    let riverPath: [number, number][] = []

    while (riverPath.length < minRiverLength) {
      riverPath.push([x / width - 0.5, y / height - 0.5])

      let lowestNeighbor = { x, y, height: Infinity }
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

          const index = (ny * width + nx) * 3
          const neighborHeight = heightMap[index + 2]
          if (neighborHeight < lowestNeighbor.height) {
            lowestNeighbor = { x: nx, y: ny, height: neighborHeight }
          }
        }
      }

      if (lowestNeighbor.height >= heightMap[(y * width + x) * 3 + 2]) {
        break
      }

      x = lowestNeighbor.x
      y = lowestNeighbor.y

      // Lower the terrain along the river path
      const index = (y * width + x) * 3
      heightMap[index + 2] = Math.max(heightMap[index + 2] - 0.5, -1)
    }

    if (riverPath.length >= minRiverLength) {
      rivers.push(riverPath)
    }
  }

  return rivers
}

const TerritoryLevel: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} intensity={0.8} />
        <BCTerrain />
        <OrbitControls />
        <Text
          position={[0, 20, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={5}
          color="white"
        >
          British Columbia Interior (250km²)
        </Text>
      </Canvas>
    </div>
  )
}

export default TerritoryLevel