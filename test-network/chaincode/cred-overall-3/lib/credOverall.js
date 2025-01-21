'use strict';

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class VehicleLifecycleContract extends Contract {

    async InitLedger(ctx) {
    const vehicles = [
        {
            vehicleDidNo: 'vehicle_001',
            manufacturerDidNo: 'manufacturer_001',
            partSupplierDidNo: 'supplier_001',
            consumerDidNo: 'consumer_001',
            dealerDidNo: 'dealer_001',
            recyclingFacilityDidNo: '',
            status: 'Manufactured',
            complianceStatus: 'Pending',
            controllerId: 'controller_001',
            parts: [
                {
                    partDidNo: 'battery_001',
                    partType: 'Battery',
                    unitId: 'unit_battery_001',
                    expireDate: '2025-12-31',
                    currentStatus: 'Operational',
                    degradationRate: 0,
                    replacementHistory: [],
                    materials: [
                        { material: 'Lithium', percentage: 40 },
                        { material: 'Nickel', percentage: 30 },
                        { material: 'Cobalt', percentage: 20 },
                        { material: 'Manganese', percentage: 10 }
                    ]
                },
                {
                    partDidNo: 'engine_001',
                    partType: 'Engine',
                    unitId: 'unit_engine_001',
                    expireDate: '2030-12-31',
                    currentStatus: 'Operational',
                    degradationRate: 0,
                    replacementHistory: []
                }
            ],
            tokens: 0,
            reputation: 0,
            referenceHash: ''
        }
    ];

    for (const vehicle of vehicles) {
        vehicle.referenceHash = this.calculateHash(vehicle.parts.map(p => p.unitId));
        await ctx.stub.putState(vehicle.vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
    }
    console.info('Ledger Initialized with dummy vehicles.');
}


    // Helper function to calculate hash from part IDs
    calculateHash(unitIds) {
        const combinedString = unitIds.join("");
        return crypto.createHash("sha256").update(combinedString).digest("hex");
    }

    // Helper function to auto-calculate degradation rate
    calculateDegradationRate(expireDate, referenceDate) {
        const expiry = new Date(expireDate);
        const reference = new Date(referenceDate); // Use passed-in date
        const timeDiff = expiry - reference;
        const totalLifespan = expiry - new Date(expiry.getFullYear() - 10, expiry.getMonth(), expiry.getDate());
        return ((totalLifespan - timeDiff) / totalLifespan) * 100;
    }
    

    // Register a new vehicle by manufacturer with unitId support
    async RegisterVehicle(ctx, vehicleDidNo, manufacturerDidNo, partSupplierDidNo, dealerDidNo, parts, referenceDate) {
        const parsedParts = JSON.parse(parts);
        const unitIds = parsedParts.map(part => part.unitId);
    
        parsedParts.forEach(part => {
            part.degradationRate = this.calculateDegradationRate(part.expireDate, referenceDate);
            if (part.partType === 'Battery') {
                part.materials = [
                    { material: 'Lithium', percentage: 40 },
                    { material: 'Nickel', percentage: 30 },
                    { material: 'Cobalt', percentage: 20 },
                    { material: 'Manganese', percentage: 10 }
                ];
            }
        });
    
        const vehicle = {
            vehicleDidNo,
            manufacturerDidNo,
            partSupplierDidNo,
            consumerDidNo: '',
            dealerDidNo,
            recyclingFacilityDidNo: '',
            status: 'Manufactured',
            complianceStatus: 'Pending',
            controllerId: `controller_${vehicleDidNo}`,
            parts: parsedParts,
            tokens: 0,
            reputation: 0,
            referenceHash: this.calculateHash(unitIds)
        };
    
        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return JSON.stringify(vehicle);
    }    


    // Update vehicle compliance status
    async UpdateCompliance(ctx, vehicleDidNo, complianceStatus) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }
        const vehicle = JSON.parse(vehicleAsBytes.toString());
        vehicle.complianceStatus = complianceStatus;
        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return JSON.stringify(vehicle);
    }

    // Report vehicle recycling and disposal
   async ReportRecycling(ctx, vehicleDidNo, recyclingFacilityDidNo) {
    const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
    if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
        throw new Error(`${vehicleDidNo} does not exist`);
    }
    const vehicle = JSON.parse(vehicleAsBytes.toString());
    vehicle.recyclingFacilityDidNo = recyclingFacilityDidNo;
    vehicle.status = 'Recycled';

    // Auto-calculate recycling purity, material recovered, and carbon savings
    vehicle.parts.forEach(part => {
        if (part.partType === 'Battery') {
            part.materials.forEach(material => {
                const purityLevel = Math.random() * 100; // Random purity for example
                material.purity = purityLevel; // Track purity for the material
                material.recoveredPercentage = (purityLevel / 100) * material.percentage;
            });
        }
    });

    vehicle.parts.forEach(part => {
        if (part.partType === 'Battery') {
            part.recyclingPurity = part.materials.reduce((acc, mat) => acc + mat.purity, 0) / part.materials.length;
            part.materialRecovered = part.materials.reduce((acc, mat) => acc + mat.recoveredPercentage, 0);
            part.carbonSavings = part.materialRecovered * 2; // Example: 2 units of carbon savings per material unit
        }
    });

    await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
    return JSON.stringify(vehicle);
}


    // Record vehicle sale to consumer
    async SellVehicle(ctx, vehicleDidNo, consumerDidNo) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }
        const vehicle = JSON.parse(vehicleAsBytes.toString());
        vehicle.consumerDidNo = consumerDidNo;
        vehicle.status = 'Sold';
        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return JSON.stringify(vehicle);
    }

    // Update vehicle maintenance or modifications by consumer
    async UpdateMaintenance(ctx, vehicleDidNo, maintenanceDetails) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }
        const vehicle = JSON.parse(vehicleAsBytes.toString());
        vehicle.maintenanceDetails = maintenanceDetails;
        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return JSON.stringify(vehicle);
    }

    // Query vehicle by ID
    async QueryVehicle(ctx, vehicleDidNo) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }
        return vehicleAsBytes.toString();
    }

    // Request parts replacement and update hash
    async RequestPartsReplacement(ctx, vehicleDidNo, partDidNo, newExpireDate) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());
        const part = vehicle.parts.find(p => p.partDidNo === partDidNo);

        if (!part) {
            throw new Error(`Part ${partDidNo} does not exist on vehicle ${vehicleDidNo}`);
        }

        // Update part replacement history and expiration date
        part.replacementHistory.push({
            replacedOn: new Date().toISOString(),
            oldExpireDate: part.expireDate
        });
        part.expireDate = newExpireDate;
        part.currentStatus = 'Replaced';

        // Recalculate degradation rate and hash after replacement
        part.degradationRate = this.calculateDegradationRate(newExpireDate);
        const unitIds = vehicle.parts.map(p => p.unitId);
        vehicle.referenceHash = this.calculateHash(unitIds);

        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return JSON.stringify(vehicle);
    }

    // Verify unit integrity by checking hash with reference hash
    async VerifyUnitIntegrity(ctx, vehicleDidNo) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());
        const unitIds = vehicle.parts.map(p => p.unitId); // Get unit IDs
        const currentHash = this.calculateHash(unitIds);

        if (currentHash === vehicle.referenceHash) {
            return {
                message: `Unit ${vehicleDidNo} integrity verified. No tampering detected.`,
                status: "Verified"
            };
        } else {
            return {
                message: `Unit ${vehicleDidNo} integrity check failed. Possible tampering detected.`,
                status: "Tampering Detected"
            };
        }
    }

    // Update the unit's reference hash on blockchain after verified modifications
    async UpdateUnitHash(ctx, vehicleDidNo) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());
        const unitIds = vehicle.parts.map(p => p.unitId); // Recollect unit IDs
        vehicle.referenceHash = this.calculateHash(unitIds); // Update with new hash

        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return {
            message: `Unit ${vehicleDidNo} hash updated on blockchain.`,
            newHash: vehicle.referenceHash
        };
    }

    // Update part status
    async UpdatePartStatus(ctx, vehicleDidNo, partDidNo, status) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }
        const vehicle = JSON.parse(vehicleAsBytes.toString());

        const part = vehicle.parts.find(p => p.partDidNo === partDidNo);
        if (!part) {
            throw new Error(`Part ${partDidNo} does not exist on vehicle ${vehicleDidNo}`);
        }

        // Update the part's current status
        part.currentStatus = status;
        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return JSON.stringify(vehicle);
    }

    // Add token reward to recycler based on recycling quality
    async RewardRecycler(ctx, vehicleDidNo, recyclingFacilityDidNo) {
    const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
    if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
        throw new Error(`${vehicleDidNo} does not exist`);
    }

    const vehicle = JSON.parse(vehicleAsBytes.toString());
    vehicle.recyclingFacilityDidNo = recyclingFacilityDidNo;

    let totalPurityLevel = 0;
    let tokensEarned = 0;
    let reputationIncrease = 0;

    // Calculate total purity level from all battery materials
    vehicle.parts.forEach(part => {
        if (part.partType === 'Battery') {
            totalPurityLevel += part.materials.reduce((acc, mat) => acc + mat.purity, 0);
        }
    });

    const averagePurityLevel = totalPurityLevel / vehicle.parts.length;

    if (averagePurityLevel >= 95) {
        tokensEarned = 50;
        reputationIncrease = 10;
    } else if (averagePurityLevel >= 80) {
        tokensEarned = 30;
        reputationIncrease = 5;
    } else if (averagePurityLevel >= 60) {
        tokensEarned = 15;
        reputationIncrease = 2;
    } else {
        tokensEarned = 5;
        reputationIncrease = 1;
    }

    vehicle.tokens += tokensEarned;
    vehicle.reputation += reputationIncrease;

    vehicle.status = 'Recycled';
    await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));

    return {
        message: `Recycler rewarded with ${tokensEarned} tokens and ${reputationIncrease} reputation points for recycling vehicle ${vehicleDidNo}.`,
        vehicle: vehicle
    };
}

    // Redeem tokens for rewards (e.g., higher-value goods or services)
    async RedeemTokens(ctx, vehicleDidNo, tokensToRedeem) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());

        if (tokensToRedeem > vehicle.tokens) {
            throw new Error(`Insufficient tokens. Available tokens: ${vehicle.tokens}`);
        }

        // Deduct tokens and update state
        vehicle.tokens -= tokensToRedeem;
        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));

        return {
            message: `${tokensToRedeem} tokens successfully redeemed`,
            vehicleDidNo: vehicle.vehicleDidNo,
            remainingTokens: vehicle.tokens
        };
    }

    // Query recycler information, including reputation and token balance
    async QueryRecycler(ctx, vehicleDidNo) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());
        return {
            vehicleDidNo: vehicle.vehicleDidNo,
            tokens: vehicle.tokens,
            reputation: vehicle.reputation,
            status: vehicle.status,
            recyclingFacilityDidNo: vehicle.recyclingFacilityDidNo
        };
    }

    // Update reputation based on recycling facility performance
    async UpdateReputation(ctx, vehicleDidNo, reputationPoints) {
        const vehicleAsBytes = await ctx.stub.getState(vehicleDidNo);
        if (!vehicleAsBytes || vehicleAsBytes.length === 0) {
            throw new Error(`${vehicleDidNo} does not exist`);
        }

        const vehicle = JSON.parse(vehicleAsBytes.toString());
        vehicle.reputation += reputationPoints;

        await ctx.stub.putState(vehicleDidNo, Buffer.from(JSON.stringify(vehicle)));
        return {
            message: `Reputation updated by ${reputationPoints} points`,
            vehicleDidNo: vehicle.vehicleDidNo,
            reputation: vehicle.reputation
        };
    }
}

module.exports = VehicleLifecycleContract;