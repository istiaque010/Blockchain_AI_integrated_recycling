const express = require('express');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Helper function to setup the gateway
async function setupGateway() {
    const ccpPath = path.resolve(__dirname, '..','test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('san-overall');

    return { gateway, contract };
}

// API Endpoints

// InitLedger
app.post('/api/initLedger', async (req, res) => {
    try {
        const { gateway, contract } = await setupGateway();
        await contract.submitTransaction('InitLedger');
        await gateway.disconnect();
        res.send({ message: 'Ledger initialized.' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// RegisterVehicle
app.post('/api/registerVehicle', async (req, res) => {
    const { vehicleDidNo, manufacturerDidNo, partSupplierDidNo, dealerDidNo, parts, referenceDate } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('RegisterVehicle', vehicleDidNo, manufacturerDidNo, partSupplierDidNo, dealerDidNo, JSON.stringify(parts), referenceDate);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// UpdateCompliance
app.put('/api/updateCompliance', async (req, res) => {
    const { vehicleDidNo, complianceStatus } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('UpdateCompliance', vehicleDidNo, complianceStatus);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// ReportRecycling
app.put('/api/reportRecycling', async (req, res) => {
    const { vehicleDidNo, recyclingFacilityDidNo } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('ReportRecycling', vehicleDidNo, recyclingFacilityDidNo);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// SellVehicle
app.put('/api/sellVehicle', async (req, res) => {
    const { vehicleDidNo, consumerDidNo } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('SellVehicle', vehicleDidNo, consumerDidNo);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// UpdateMaintenance
app.put('/api/updateMaintenance', async (req, res) => {
    const { vehicleDidNo, maintenanceDetails } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('UpdateMaintenance', vehicleDidNo, maintenanceDetails);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// QueryVehicle
app.get('/api/queryVehicle/:vehicleDidNo', async (req, res) => {
    const { vehicleDidNo } = req.params;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.evaluateTransaction('QueryVehicle', vehicleDidNo);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// RequestPartsReplacement
app.put('/api/requestPartsReplacement', async (req, res) => {
    const { vehicleDidNo, partDidNo, newExpireDate } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('RequestPartsReplacement', vehicleDidNo, partDidNo, newExpireDate);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// VerifyUnitIntegrity
app.get('/api/verifyUnitIntegrity/:vehicleDidNo', async (req, res) => {
    const { vehicleDidNo } = req.params;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.evaluateTransaction('VerifyUnitIntegrity', vehicleDidNo);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// UpdateUnitHash
app.put('/api/updateUnitHash', async (req, res) => {
    const { vehicleDidNo } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('UpdateUnitHash', vehicleDidNo);
        await gateway.disconnect();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// UpdatePartStatus
app.put('/api/updatePartStatus', async (req, res) => {
    const { vehicleDidNo, partDidNo, status } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('UpdatePartStatus', vehicleDidNo, partDidNo, status);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// RewardRecycler
app.put('/api/rewardRecycler', async (req, res) => {
    const { vehicleDidNo, recyclingFacilityDidNo } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('RewardRecycler', vehicleDidNo, recyclingFacilityDidNo);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// RedeemTokens
app.put('/api/redeemTokens', async (req, res) => {
    const { vehicleDidNo, tokensToRedeem } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('RedeemTokens', vehicleDidNo, tokensToRedeem);
        await gateway.disconnect();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// QueryRecycler
app.get('/api/queryRecycler/:vehicleDidNo', async (req, res) => {
    const { vehicleDidNo } = req.params;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.evaluateTransaction('QueryRecycler', vehicleDidNo);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// UpdateReputation
app.put('/api/updateReputation', async (req, res) => {
    const { vehicleDidNo, reputationPoints } = req.body;
    try {
        const { gateway, contract } = await setupGateway();
        const result = await contract.submitTransaction('UpdateReputation', vehicleDidNo, reputationPoints);
        await gateway.disconnect();
        res.send(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
