"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class RegisterVehicleWorkload extends WorkloadModuleBase {
  constructor() {
    super();
    this.generatedIds = new Set();
  }

  generateVehicleId() {
    const idNum = this.generatedIds.size + 1; // Sequential IDs
    this.generatedIds.add(idNum);
    return `VD-${idNum}`;
  }


  async submitTransaction() {
    const vehicleDidNo = this.generateVehicleId();
    const manufacturerDidNo = "Manufacturer-Test";
    const partSupplierDidNo = "PartSupplier-Test";
    const dealerDidNo = "Dealer-Test";

    const parts = [
        { unitId: "Unit1", partType: "Battery", expireDate: "2030-12-31" },
        { unitId: "Unit2", partType: "Engine", expireDate: "2040-01-01" }
    ];

    const referenceDate = "2024-01-01"; // Fixed reference date for testing consistency

    const args = {
        contractId: this.roundArguments.contractId,
        contractFunction: "RegisterVehicle",
        invokerIdentity: "User1",
        contractArguments: [
            vehicleDidNo,
            manufacturerDidNo,
            partSupplierDidNo,
            dealerDidNo,
            JSON.stringify(parts),
            referenceDate
        ],
        readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);
}

  async cleanupWorkloadModule() {
    // Cleanup logic if needed
  }
}

function createWorkloadModule() {
  return new RegisterVehicleWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
