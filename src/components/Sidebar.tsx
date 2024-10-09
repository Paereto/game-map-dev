import React from 'react'
import { Map, Globe, User } from 'lucide-react'

type Level = 'territory' | 'community' | 'character'

interface SidebarProps {
  currentLevel: Level
  setCurrentLevel: (level: Level) => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentLevel, setCurrentLevel }) => {
  return (
    <aside className="bg-gray-800 text-white w-16 flex flex-col items-center py-4">
      <button
        className={`p-2 mb-4 rounded-full ${
          currentLevel === 'territory' ? 'bg-blue-500' : 'hover:bg-gray-700'
        }`}
        onClick={() => setCurrentLevel('territory')}
      >
        <Globe size={24} />
      </button>
      <button
        className={`p-2 mb-4 rounded-full ${
          currentLevel === 'community' ? 'bg-blue-500' : 'hover:bg-gray-700'
        }`}
        onClick={() => setCurrentLevel('community')}
      >
        <Map size={24} />
      </button>
      <button
        className={`p-2 mb-4 rounded-full ${
          currentLevel === 'character' ? 'bg-blue-500' : 'hover:bg-gray-700'
        }`}
        onClick={() => setCurrentLevel('character')}
      >
        <User size={24} />
      </button>
    </aside>
  )
}

export default Sidebar