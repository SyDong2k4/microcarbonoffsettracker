// contract/microcarbonoffsettracker/sources/microcarbonoffsettracker.move
module microcarbonoffsettracker::carbon {
    // === Errors ===
    const E_INVALID_AMOUNT: u64 = 0;
    const E_NOT_OWNER: u64 = 1;
    const E_INVALID_VEHICLE_TYPE: u64 = 2;
    
    // === Structs ===
    
    /// User's carbon footprint record
    public struct CarbonRecord has key {
        id: UID,
        user: address,
        vehicle_type: u8,      // 0=car, 1=motorcycle, 2=bus, 3=train, 4=bike
        distance_km: u64,
        carbon_grams: u64,
        offset_kg: u64         // Carbon offset purchased
    }
    
    /// Global carbon statistics
    public struct CarbonStats has key {
        id: UID,
        total_distance: u64,
        total_carbon: u64,     // Total carbon in grams
        record_count: u64,
        owner: address
    }
    
    // === Initialization ===
    
    /// Initialize carbon tracker
    public entry fun initialize(ctx: &mut TxContext) {
        let stats = CarbonStats {
            id: object::new(ctx),
            total_distance: 0,
            total_carbon: 0,
            record_count: 0,
            owner: tx_context::sender(ctx)
        };
        
        transfer::share_object(stats);
    }
    
    // === Core Functions ===
    
    /// Record a trip and calculate carbon
    public entry fun record_trip(
        stats: &mut CarbonStats,
        vehicle_type: u8,
        distance_km: u64,
        ctx: &mut TxContext
    ) {
        assert!(distance_km > 0, E_INVALID_AMOUNT);
        assert!(vehicle_type < 8, E_INVALID_VEHICLE_TYPE); // 0-7 vehicle types
        
        // Calculate carbon based on vehicle type
        let carbon_grams = calculate_carbon(vehicle_type, distance_km);
        
        // Create new record
        let record = CarbonRecord {
            id: object::new(ctx),
            user: tx_context::sender(ctx),
            vehicle_type,
            distance_km,
            carbon_grams,
            offset_kg: 0
        };
        
        // Update statistics
        stats.total_distance = stats.total_distance + distance_km;
        stats.total_carbon = stats.total_carbon + carbon_grams;
        stats.record_count = stats.record_count + 1;
        
        // Transfer record to user
        transfer::transfer(record, tx_context::sender(ctx));
    }
    
    /// Calculate carbon for a trip
    fun calculate_carbon(vehicle_type: u8, distance_km: u64): u64 {
        let factor = get_emission_factor(vehicle_type);
        factor * distance_km
    }
    
    /// Get emission factor for vehicle type
    fun get_emission_factor(vehicle_type: u8): u64 {
        // Emission factors in grams per km
        if (vehicle_type == 0) {
            170  // car gasoline
        } else if (vehicle_type == 1) {
            160  // car diesel
        } else if (vehicle_type == 2) {
            50   // car electric
        } else if (vehicle_type == 3) {
            100  // motorcycle
        } else if (vehicle_type == 4) {
            90   // bus
        } else if (vehicle_type == 5) {
            30   // train
        } else if (vehicle_type == 6) {
            0    // bike
        } else {
            0    // walking (type 7)
        }
    }
    
    /// Purchase carbon offset
    public entry fun purchase_offset(
        record: &mut CarbonRecord,
        offset_kg: u64,
        ctx: &TxContext
    ) {
        assert!(record.user == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(offset_kg > 0, E_INVALID_AMOUNT);
        
        record.offset_kg = record.offset_kg + offset_kg;
    }
    
    // === View Functions ===
    
    /// Get user's total carbon footprint from record
    public fun get_user_carbon(record: &CarbonRecord): u64 {
        record.carbon_grams
    }
    
    /// Get user's offset balance
    public fun get_user_offset(record: &CarbonRecord): u64 {
        record.offset_kg
    }
    
    /// Get global statistics
    public fun get_stats(stats: &CarbonStats): (u64, u64, u64) {
        (stats.total_distance, stats.total_carbon, stats.record_count)
    }
    
    /// Compare two trips
    public fun compare_trips(
        record1: &CarbonRecord,
        record2: &CarbonRecord
    ): (u64, u8) {
        let saving: u64;
        let better_vehicle: u8;
        
        if (record1.carbon_grams > record2.carbon_grams) {
            saving = record1.carbon_grams - record2.carbon_grams;
            better_vehicle = record2.vehicle_type;
        } else {
            saving = record2.carbon_grams - record1.carbon_grams;
            better_vehicle = record1.vehicle_type;
        };
        
        (saving, better_vehicle)
    }
    
    /// Get emission factor publicly
    public fun get_emission_factor_public(vehicle_type: u8): u64 {
        get_emission_factor(vehicle_type)
    }
    
    /// Update stats owner (admin only)
    public entry fun update_stats_owner(
        stats: &mut CarbonStats,
        new_owner: address,
        ctx: &TxContext
    ) {
        assert!(stats.owner == tx_context::sender(ctx), E_NOT_OWNER);
        stats.owner = new_owner;
    }
    
    /// Simple function to increment total carbon (for testing)
    public entry fun increment_total_carbon(
        stats: &mut CarbonStats,
        amount: u64,
        ctx: &TxContext
    ) {
        assert!(stats.owner == tx_context::sender(ctx), E_NOT_OWNER);
        stats.total_carbon = stats.total_carbon + amount;
    }
}