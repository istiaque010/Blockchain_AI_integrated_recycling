"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class UpdateMaintenanceWorkload extends WorkloadModuleBase {
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
    const vehicleDid = this.generateVehicleId();
    const maintenanceDetails = {
      date: new Date().toISOString(),
      details: "Routine maintenance completed",
      cost: Math.floor(Math.random() * 1000),
    };

    const args = {
      contractId: this.roundArguments.contractId,
      contractFunction: "UpdateMaintenance",
      invokerIdentity: "User1",
      contractArguments: [vehicleDid, JSON.stringify(maintenanceDetails)],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);
  }
}

function createWorkloadModule() {
  return new UpdateMaintenanceWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
