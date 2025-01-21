"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class VerifyUnitIntegrityWorkload extends WorkloadModuleBase {
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

    const args = {
      contractId: this.roundArguments.contractId,
      contractFunction: "VerifyUnitIntegrity",
      invokerIdentity: "User1",
      contractArguments: [vehicleDid],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);
  }
}

function createWorkloadModule() {
  return new VerifyUnitIntegrityWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
