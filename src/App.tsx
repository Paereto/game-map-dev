import React, { useState } from 'react'
import TerritoryLevel from './components/TerritoryLevel'
import CommunityLevel from './components/CommunityLevel'
import CharacterLevel from './components/CharacterLevel'
import Sidebar from './components/Sidebar'
import { MapProvider } from './context/MapContext'

type Level = 'territory' | 'community' | 'character'

function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>('territory')

  const renderLevel = () => {
    switch (currentLevel) {
      case 'territory':
        return <TerritoryLevel />
      case 'community':
        return <CommunityLevel />
      case 'character':
        return <CharacterLevel />
      default:
        return null
    }
  }

  return (
    <MapProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">3D Interactive Map System</h1>
          <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            {renderLevel()}
          </div>
        </main>
      </div>
    </MapProvider>
  )
}

export default App