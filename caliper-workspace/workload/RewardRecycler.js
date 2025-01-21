"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class RewardRecyclerWorkload extends WorkloadModuleBase {
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
    const rewardPoints = Math.floor(Math.random() * 100);

    const args = {
      contractId: this.roundArguments.contractId,
      contractFunction: "RewardRecycler",
      invokerIdentity: "User1",
      contractArguments: [vehicleDid, rewardPoints.toString()],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(args);
  }
}

function createWorkloadModule() {
  return new RewardRecyclerWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
