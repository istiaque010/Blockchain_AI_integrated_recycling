"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class RequestPartsReplacementWorkload extends WorkloadModuleBase {
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
    const partName = "Part-" + Math.random().toString(36).substring(2, 5);
    const cost = Math.floor(Math.random() * 500);

    const args = {
      contractId: this.roundArguments.contractId,
      contractFunction: "RequestPartsReplacement",
      invokerIdentity: "User1",
      contractArguments: [vehicleDid, partName, cost.toString()],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);
  }
}

function createWorkloadModule() {
  return new RequestPartsReplacementWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
