"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class SellVehicleWorkload extends WorkloadModuleBase {
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
    const newOwner = "NewOwner-" + Math.random().toString(36).substring(2, 5);

    const args = {
      contractId: this.roundArguments.contractId,
      contractFunction: "SellVehicle",
      invokerIdentity: "User1",
      contractArguments: [vehicleDid, newOwner],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);
  }
}

function createWorkloadModule() {
  return new SellVehicleWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
