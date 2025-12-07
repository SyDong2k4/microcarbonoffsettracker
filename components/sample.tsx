// components/sample.tsx
"use client"

import { useState } from "react"
import { useContract, VEHICLE_TYPES, VEHICLE_NAMES } from "@/hooks/useContract"
import { WalletConnect } from "@/components/Wallet-connect"
import TransactionStatus from "@/components/TransactionStatus"

export default function SampleIntegration() {
  const {
    address,
    isConnected,
    globalStats,
    userRecords,
    recordTrip,
    purchaseOffset,
    initializeContract,
    calculateCarbonLocal,
    compareVehicles,
    calculateYearlyImpact,
    suggestAlternatives,
    calculateEquivalents,
    getUserTotalCarbon,
    getUserTotalOffset,
    calculateNetCarbon,
    isLoading,
    error,
    setError,
    formatCarbon
  } = useContract()

  const [vehicleType, setVehicleType] = useState<number>(VEHICLE_TYPES.CAR_GASOLINE)
  const [distance, setDistance] = useState<number>(10)
  const [offsetAmount, setOffsetAmount] = useState<number>(1)
  const [selectedRecordId, setSelectedRecordId] = useState<string>("")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [transactionType, setTransactionType] = useState<"record" | "offset" | "initialize">("record")
  
  const [dailyDistance, setDailyDistance] = useState<number>(20)
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5)
  const [weeksPerYear, setWeeksPerYear] = useState<number>(48)

  const handleRecordTrip = async () => {
    if (!isConnected) {
      setError(new Error("Please connect wallet first"))
      return
    }
    
    setTransactionType("record")
    try {
      await recordTrip(vehicleType, distance)
      setTransactionHash(`0x${Date.now().toString(16)}`)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const handlePurchaseOffset = async (recordId: string) => {
    if (!isConnected) {
      setError(new Error("Please connect wallet first"))
      return
    }
    
    setTransactionType("offset")
    try {
      await purchaseOffset(recordId, offsetAmount)
      setTransactionHash(`0x${Date.now().toString(16)}`)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const handleInitialize = async () => {
    if (!isConnected) {
      setError(new Error("Please connect wallet first"))
      return
    }
    
    setTransactionType("initialize")
    try {
      await initializeContract()
      setTransactionHash(`0x${Date.now().toString(16)}`)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const yearlyImpact = calculateYearlyImpact(
    vehicleType,
    dailyDistance,
    daysPerWeek,
    weeksPerYear
  )

  const carbonCalculation = calculateCarbonLocal(vehicleType, distance)
  const carbonKg = carbonCalculation / 1000
  const equivalents = calculateEquivalents(carbonKg)

  const totalCarbonKg = getUserTotalCarbon() / 1000
  const totalOffset = getUserTotalOffset()
  const netCarbon = calculateNetCarbon()

  const alternatives = suggestAlternatives(vehicleType, distance)

  const comparison = compareVehicles(
    VEHICLE_TYPES.CAR_GASOLINE,
    VEHICLE_TYPES.BIKE,
    10
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🌿 Micro Carbon Offset Tracker</h1>
          <p className="text-gray-600 mt-2">Track and offset your carbon footprint on IOTA</p>
        </div>

        <WalletConnect />

        {/* Transaction Status */}
        <TransactionStatus 
          hash={transactionHash}
          error={error}
          isLoading={isLoading}
          type={transactionType}
          onDismiss={() => {
            setTransactionHash("")
            setError(null)
          }}
        />

        {/* Connection Status */}
        {!isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center my-8">
            <h2 className="text-xl font-semibold text-yellow-800">🔗 Connect Your Wallet</h2>
            <p className="text-yellow-600 mt-2">Please connect your wallet to start tracking your carbon footprint</p>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">👤 Your Wallet</h2>
                  <p className="text-gray-600 font-mono text-sm mt-1">{address?.slice(0, 20)}...{address?.slice(-8)}</p>
                </div>
                <button
                  onClick={handleInitialize}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Initializing..." : "Initialize Contract"}
                </button>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600">Total Carbon</p>
                  <p className="text-2xl font-bold text-blue-800">{totalCarbonKg.toFixed(2)} kg</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600">Total Offset</p>
                  <p className="text-2xl font-bold text-green-800">{totalOffset.toFixed(2)} kg</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600">Net Carbon</p>
                  <p className="text-2xl font-bold text-red-800">{netCarbon.toFixed(2)} kg</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-600">Trips Recorded</p>
                  <p className="text-2xl font-bold text-purple-800">{userRecords.length}</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Record Trip */}
              <div className="space-y-8">
                {/* Record Trip Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  {/* FIXED: Gradient text for "Record New Trip" */}
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
                    🚗 Record New Trip
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {VEHICLE_NAMES.map((name, index) => (
                          <option key={index} value={index}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Carbon:</span>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCarbon(carbonCalculation)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleRecordTrip}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Recording..." : "Record Trip on Blockchain"}
                    </button>
                  </div>
                </div>

                {/* Yearly Impact Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
                    📅 Yearly Impact Calculator
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Distance (km)
                        </label>
                        <input
                          type="number"
                          value={dailyDistance}
                          onChange={(e) => setDailyDistance(Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days/Week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          value={daysPerWeek}
                          onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weeks/Year
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={weeksPerYear}
                          onChange={(e) => setWeeksPerYear(Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <div className="space-y-2 text-gray-900">
                        <div className="flex justify-between">
                          <span>Yearly Carbon:</span>
                          <span className="font-bold">{yearlyImpact.yearlyCarbonKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Carbon:</span>
                          <span className="font-bold">{yearlyImpact.monthlyCarbon} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trees Needed to Offset:</span>
                          <span className="font-bold text-green-700">{yearlyImpact.treesNeeded} 🌳</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Global Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🌍 Global Statistics</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Distance</p>
                        <p className="text-xl font-bold text-gray-900">{globalStats.totalDistance} km</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Carbon</p>
                        <p className="text-xl font-bold text-gray-900">{globalStats.totalCarbonKg.toFixed(2)} kg</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Records</p>
                        <p className="text-xl font-bold text-gray-900">{globalStats.recordCount}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Avg per Trip</p>
                        <p className="text-xl font-bold text-gray-900">
                          {globalStats.recordCount > 0 
                            ? (globalStats.totalCarbon / globalStats.recordCount / 1000).toFixed(2) 
                            : "0"} kg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Records & Offsets */}
              <div className="space-y-8">
                {/* Your Trips */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Your Trips</h2>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {userRecords.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No trips recorded yet</p>
                    ) : (
                      userRecords.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{record.vehicleName.split(' ')[0]}</span>
                                <h3 className="font-semibold text-gray-900">{record.vehicleName}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {record.distanceKm} km • {record.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">{record.carbonKg.toFixed(2)} kg CO₂</p>
                              <p className="text-sm text-green-600">Offset: {record.offsetKg.toFixed(2)} kg</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-gray-500">Net:</span>
                              <span className={`ml-2 font-medium ${record.carbonKg - record.offsetKg > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {(record.carbonKg - record.offsetKg).toFixed(2)} kg
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={offsetAmount}
                                onChange={(e) => setOffsetAmount(Number(e.target.value))}
                                className="w-24 p-2 border border-gray-300 rounded-lg"
                                placeholder="kg"
                              />
                              <button
                                onClick={() => handlePurchaseOffset(record.id)}
                                disabled={isLoading}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                Offset
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Eco Alternatives */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🌱 Eco-Friendly Alternatives</h2>
                  
                  <div className="space-y-4">
                    {alternatives.length > 0 ? (
                      alternatives.map((alt, index) => (
                        <div key={index} className="border border-green-200 bg-green-50 rounded-xl p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-green-800">{alt.name}</p>
                              <p className="text-sm text-green-600">
                                {formatCarbon(alt.carbon)} CO₂
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-700">
                                Save {formatCarbon(alt.saving)}
                              </p>
                              <p className="text-sm text-green-600">
                                {Math.round((alt.saving / (carbonCalculation || 1)) * 100)}% reduction
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">You're already using the greenest option! 🎉</p>
                    )}
                  </div>

                  {/* Vehicle Comparison */}
                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-4">🚗 vs 🚲 Comparison</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-center">
                          <p className="font-bold text-gray-900">{comparison.vehicle1.name}</p>
                          <p className="text-red-800 font-semibold">{comparison.vehicle1.carbonKg} kg</p>
                        </div>
                        <div className="text-xl text-gray-900">➔</div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">{comparison.vehicle2.name}</p>
                          <p className="text-green-800 font-semibold">{comparison.vehicle2.carbonKg} kg</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-700">
                          Save {comparison.savingKg} kg CO₂
                        </p>
                        <p className="text-sm text-gray-700">
                          That's like {Math.ceil(Number(comparison.savingKg) * 24)} smartphone charges!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carbon Equivalents */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">⚖️ Carbon Equivalents</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <p className="text-3xl">🌳</p>
                      <p className="font-bold text-blue-800 mt-2">{equivalents.trees}</p>
                      <p className="text-sm text-blue-600">Trees needed</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <p className="text-3xl">📱</p>
                      <p className="font-bold text-purple-800 mt-2">{equivalents.smartphones}</p>
                      <p className="text-sm text-purple-600">Smartphone charges</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                      <p className="text-3xl">📺</p>
                      <p className="font-bold text-orange-800 mt-2">{equivalents.tvHours}</p>
                      <p className="text-sm text-orange-600">TV hours</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl text-center">
                      <p className="text-3xl">🚗</p>
                      <p className="font-bold text-red-800 mt-2">{equivalents.carKm}</p>
                      <p className="text-sm text-red-600">Car km equivalent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with ❤️ on IOTA • All data is stored on the blockchain</p>
          <p className="mt-1">Contract ID: {process.env.NEXT_PUBLIC_PACKAGE_ID || "Not deployed"}</p>
        </div>
      </div>
    </div>
  )
}