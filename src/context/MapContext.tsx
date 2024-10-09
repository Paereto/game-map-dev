import React, { createContext, useContext, useState, useEffect } from 'react'

interface MapState {
  territory: {
    climate: string
    policies: string[]
    population?: number
  }
  community: {
    [key: string]: {
      buildings: number
      population: number
    }
  }
  character: {
    [key: string]: {
      position: { x: number, y: number, z: number }
      inventory: string[]
    }
  }
}

interface MapContextType {
  state: MapState
  updateTerritory: (update: Partial<MapState['territory']>) => void
  updateCommunity: (key: string, update: Partial<MapState['community'][string]>) => void
  updateCharacter: (key: string, update: Partial<MapState['character'][string]>) => void
}

const initialState: MapState = {
  territory: {
    climate: 'temperate',
    policies: [],
    population: 0,
  },
  community: {
    city1: {
      buildings: 0,
      population: 0,
    },
  },
  character: {
    player1: {
      position: { x: 0, y: 0.5, z: 0 },
      inventory: [],
    },
  },
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MapState>(initialState)

  const updateTerritory = (update: Partial<MapState['territory']>) => {
    setState(prevState => ({
      ...prevState,
      territory: { ...prevState.territory, ...update },
    }))
  }

  const updateCommunity = (key: string, update: Partial<MapState['community'][string]>) => {
    setState(prevState => ({
      ...prevState,
      community: {
        ...prevState.community,
        [key]: { ...prevState.community[key], ...update },
      },
    }))
  }

  const updateCharacter = (key: string, update: Partial<MapState['character'][string]>) => {
    setState(prevState => ({
      ...prevState,
      character: {
        ...prevState.character,
        [key]: { ...prevState.character[key], ...update },
      },
    }))
  }

  useEffect(() => {
    // Simulate periodic updates
    const interval = setInterval(() => {
      // Aggregate community data to update territory
      const totalPopulation = Object.values(state.community).reduce(
        (sum, community) => sum + community.population,
        0
      )
      updateTerritory({ population: totalPopulation })
    }, 5000)

    return () => clearInterval(interval)
  }, [state.community])

  return (
    <MapContext.Provider value={{ state, updateTerritory, updateCommunity, updateCharacter }}>
      {children}
    </MapContext.Provider>
  )
}

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}