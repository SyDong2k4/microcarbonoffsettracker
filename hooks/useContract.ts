"use client"

import { useState, useEffect, useCallback } from "react"
import {
  useCurrentAccount,
  useIotaClient,
  useSignAndExecuteTransaction,
} from "@iota/dapp-kit"
import { useNetworkVariable } from "@/lib/config"

// Vehicle types matching the contract
export const VEHICLE_TYPES = {
  CAR_GASOLINE: 0,
  CAR_DIESEL: 1,
  CAR_ELECTRIC: 2,
  MOTORCYCLE: 3,
  BUS: 4,
  TRAIN: 5,
  BIKE: 6,
  WALKING: 7,
} as const

export const VEHICLE_NAMES = [
  "🚗 Gasoline Car",
  "🚙 Diesel Car", 
  "🔌 Electric Car",
  "🏍️ Motorcycle",
  "🚌 Bus",
  "🚆 Train",
  "🚲 Bicycle",
  "🚶 Walking"
]

export const EMISSION_FACTORS = [170, 160, 50, 100, 90, 30, 0, 0] // g/km

export interface CarbonRecord {
  id: string
  vehicleType: number
  vehicleName: string
  distanceKm: number
  carbonGrams: number
  carbonKg: number
  offsetKg: number
  timestamp: number
  date: string
}

export interface GlobalStats {
  totalDistance: number
  totalCarbon: number
  totalCarbonKg: number
  recordCount: number
}

export const useContract = () => {
  const currentAccount = useCurrentAccount()
  const address = currentAccount?.address
  const packageId = useNetworkVariable("packageId")
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalDistance: 0,
    totalCarbon: 0,
    totalCarbonKg: 0,
    recordCount: 0
  })
  
  const [userRecords, setUserRecords] = useState<CarbonRecord[]>([
    // Sample data for demo
    {
      id: "1",
      vehicleType: VEHICLE_TYPES.CAR_GASOLINE,
      vehicleName: "🚗 Gasoline Car",
      distanceKm: 15,
      carbonGrams: 2550,
      carbonKg: 2.55,
      offsetKg: 1,
      timestamp: Date.now() - 86400000,
      date: "2024-01-15"
    },
    {
      id: "2",
      vehicleType: VEHICLE_TYPES.BUS,
      vehicleName: "🚌 Bus",
      distanceKm: 10,
      carbonGrams: 900,
      carbonKg: 0.9,
      offsetKg: 0,
      timestamp: Date.now() - 172800000,
      date: "2024-01-14"
    },
    {
      id: "3",
      vehicleType: VEHICLE_TYPES.BIKE,
      vehicleName: "🚲 Bicycle",
      distanceKm: 5,
      carbonGrams: 0,
      carbonKg: 0,
      offsetKg: 0,
      timestamp: Date.now() - 259200000,
      date: "2024-01-13"
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statsObjectId, setStatsObjectId] = useState<string | null>(null)

  // Contract methods
  const CONTRACT_METHODS = {
    INITIALIZE: "initialize",
    RECORD_TRIP: "record_trip",
    PURCHASE_OFFSET: "purchase_offset",
    INCREMENT_TOTAL: "increment_total_carbon",
  }

  // Calculate carbon locally
  const calculateCarbonLocal = useCallback((vehicleType: number, distanceKm: number): number => {
    if (vehicleType < 0 || vehicleType >= EMISSION_FACTORS.length) {
      return 0
    }
    return EMISSION_FACTORS[vehicleType] * distanceKm
  }, [])

  // Initialize contract
  const initializeContract = async (): Promise<void> => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate contract initialization
      setTimeout(() => {
        setGlobalStats({
          totalDistance: 0,
          totalCarbon: 0,
          totalCarbonKg: 0,
          recordCount: 0
        })
        setStatsObjectId("0xSIMULATED_STATS_ID")
        console.log("Contract initialized (simulated)")
        setIsLoading(false)
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsLoading(false)
    }
  }

  // Record a trip
  const recordTrip = async (vehicleType: number, distanceKm: number): Promise<void> => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      const carbonGrams = calculateCarbonLocal(vehicleType, distanceKm)
      const carbonKg = carbonGrams / 1000
      
      const newRecord: CarbonRecord = {
        id: Date.now().toString(),
        vehicleType,
        vehicleName: VEHICLE_NAMES[vehicleType],
        distanceKm,
        carbonGrams,
        carbonKg,
        offsetKg: 0,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      }
      
      // Update local state
      setUserRecords(prev => [newRecord, ...prev])
      setGlobalStats(prev => ({
        totalDistance: prev.totalDistance + distanceKm,
        totalCarbon: prev.totalCarbon + carbonGrams,
        totalCarbonKg: prev.totalCarbonKg + carbonKg,
        recordCount: prev.recordCount + 1
      }))
      
      // Simulate blockchain transaction
      console.log("Recording trip to blockchain:", {
        vehicleType,
        distanceKm,
        carbonGrams
      })
      
      setIsLoading(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsLoading(false)
    }
  }

  // Purchase carbon offset
  const purchaseOffset = async (recordId: string, offsetKg: number): Promise<void> => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Update local state
      setUserRecords(prev => 
        prev.map(record => 
          record.id === recordId 
            ? { ...record, offsetKg: record.offsetKg + offsetKg }
            : record
        )
      )
      
      // Simulate blockchain transaction
      console.log("Purchasing offset on blockchain:", {
        recordId,
        offsetKg
      })
      
      setIsLoading(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsLoading(false)
    }
  }

  // Compare vehicles
  const compareVehicles = useCallback((vehicle1: number, vehicle2: number, distance: number) => {
    const carbon1 = calculateCarbonLocal(vehicle1, distance)
    const carbon2 = calculateCarbonLocal(vehicle2, distance)
    
    const saving = Math.abs(carbon1 - carbon2)
    const betterVehicle = carbon1 < carbon2 ? vehicle1 : vehicle2
    
    return {
      vehicle1: {
        type: vehicle1,
        name: VEHICLE_NAMES[vehicle1],
        carbon: carbon1,
        carbonKg: (carbon1 / 1000).toFixed(2)
      },
      vehicle2: {
        type: vehicle2,
        name: VEHICLE_NAMES[vehicle2],
        carbon: carbon2,
        carbonKg: (carbon2 / 1000).toFixed(2)
      },
      saving,
      savingKg: (saving / 1000).toFixed(2),
      betterVehicle: {
        type: betterVehicle,
        name: VEHICLE_NAMES[betterVehicle]
      },
      percentage: Math.round((saving / Math.max(carbon1, carbon2)) * 100)
    }
  }, [calculateCarbonLocal])

  // Calculate yearly impact
  const calculateYearlyImpact = useCallback((
    vehicleType: number, 
    dailyDistance: number, 
    daysPerWeek: number,
    weeksPerYear: number
  ) => {
    const weeklyDistance = dailyDistance * daysPerWeek
    const yearlyDistance = weeklyDistance * weeksPerYear
    const yearlyCarbon = calculateCarbonLocal(vehicleType, yearlyDistance)
    
    // Convert to kg and equivalent trees
    const yearlyCarbonKg = yearlyCarbon / 1000
    const treesNeeded = Math.ceil(yearlyCarbonKg / 21) // 1 tree absorbs ~21kg CO2/year
    
    return {
      yearlyDistance,
      yearlyCarbon,
      yearlyCarbonKg: yearlyCarbonKg.toFixed(1),
      treesNeeded,
      dailyCarbon: (calculateCarbonLocal(vehicleType, dailyDistance) / 1000).toFixed(2),
      weeklyCarbon: (calculateCarbonLocal(vehicleType, weeklyDistance) / 1000).toFixed(2),
      monthlyCarbon: (calculateCarbonLocal(vehicleType, dailyDistance * daysPerWeek * 4) / 1000).toFixed(2)
    }
  }, [calculateCarbonLocal])

  // Get user's total carbon
  const getUserTotalCarbon = useCallback((): number => {
    return userRecords.reduce((total, record) => total + record.carbonGrams, 0)
  }, [userRecords])

  // Get user's total offset
  const getUserTotalOffset = useCallback((): number => {
    return userRecords.reduce((total, record) => total + record.offsetKg, 0)
  }, [userRecords])

  // Calculate net carbon
  const calculateNetCarbon = useCallback((): number => {
    const totalCarbon = getUserTotalCarbon() / 1000
    const totalOffset = getUserTotalOffset()
    return Math.max(0, totalCarbon - totalOffset)
  }, [getUserTotalCarbon, getUserTotalOffset])

  // Suggest eco-friendly alternatives
  const suggestAlternatives = useCallback((currentVehicle: number, distance: number) => {
    const currentCarbon = calculateCarbonLocal(currentVehicle, distance)
    
    const alternatives = EMISSION_FACTORS.map((factor, index) => ({
      vehicleType: index,
      name: VEHICLE_NAMES[index],
      carbon: factor * distance,
      saving: currentCarbon - (factor * distance),
      factor
    }))
    .filter(alt => alt.carbon < currentCarbon && alt.saving > 0)
    .sort((a, b) => b.saving - a.saving)
    .slice(0, 3)
    
    return alternatives
  }, [calculateCarbonLocal])

  // Calculate carbon equivalents
  const calculateEquivalents = useCallback((carbonKg: number) => {
    return {
      trees: Math.ceil(carbonKg / 21), // 1 tree absorbs ~21kg/year
      smartphones: Math.ceil(carbonKg * 24), // 1kg CO2 = 24 smartphone charges
      tvHours: Math.ceil(carbonKg * 100), // 1kg CO2 = 100 hours of TV
      carKm: (carbonKg * 1000 / 170).toFixed(1) // Based on gasoline car
    }
  }, [])

  return {
    // Account
    account: currentAccount,
    address,
    isConnected: !!address,
    
    // Data
    globalStats,
    userRecords,
    
    // Calculations
    calculateCarbonLocal,
    compareVehicles,
    calculateYearlyImpact,
    suggestAlternatives,
    calculateEquivalents,
    
    // User stats
    getUserTotalCarbon,
    getUserTotalOffset,
    calculateNetCarbon,
    
    // Actions
    initializeContract,
    recordTrip,
    purchaseOffset,
    
    // State
    isLoading,
    isPending,
    error,
    setError,
    
    // Constants
    vehicleTypes: VEHICLE_TYPES,
    vehicleNames: VEHICLE_NAMES,
    emissionFactors: EMISSION_FACTORS,
    
    // Helpers
    formatCarbon: (grams: number) => {
      if (grams < 1000) return `${grams} g`
      return `${(grams / 1000).toFixed(2)} kg`
    }
  }
}