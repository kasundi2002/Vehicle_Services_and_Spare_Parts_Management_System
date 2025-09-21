const express = require('express');
const router = express.Router();
const Inventory = require('./models/InventoryModel');
const { sendEmail } = require('../services/emailService');

router.post("/insertinventory", async (req, res) => {
    const { InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description } = req.body;

    try {
        // Create a new inventory item without specifying InventoryID
        const addInventory = new Inventory({ InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description });

        // Save the new inventory item
        await addInventory.save();

        res.status(201).json(addInventory);
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal server error");
    }
});

router.get('/inventory', async (req, res) => {
    try {
        // Retrieve all inventory items
        const getInventory = await Inventory.find({});
        res.status(200).json(getInventory);
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal server error");
    }
});

router.get('/inventory/:id', async (req, res) => {
    try {
        // Retrieve a specific inventory item by ID
        const getInventoryItem = await Inventory.findById(req.params.id);
        res.status(200).json(getInventoryItem);
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal server error");
    }
});

router.put('/updateinventory/:id', async (req, res) => {
    try {
        // Update an inventory item by ID
        const { InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description } = req.body;
        const updateInventory = await Inventory.findByIdAndUpdate(req.params.id, { InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description }, { new: true });
        res.status(200).json(updateInventory);
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal server error");
    }
});

router.delete('/deleteinventory/:id', async (req, res) => {
    try {
        // Delete an inventory item by ID
        const deleteInventoryItem = await Inventory.findByIdAndDelete(req.params.id);
        res.status(200).json(deleteInventoryItem);
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal server error");
    }
});

// Check inventory levels and send email notification if below threshold
router.post('/sendmail', async (req, res) => {
    try {
        const threshold = 10; // Define your threshold here
        const inventoryItems = await Inventory.find({});
        
        // Calculate total inventory units
        const totalInventoryUnits = inventoryItems.reduce((total, item) => total + item.UnitNo, 0);
        
        if (totalInventoryUnits < threshold) {
            const emailContent = `Inventory levels are low. Please replenish stock.`;
            await sendEmail('pavithrameddaduwage@gmail.com', 'Low Inventory Alert', emailContent);
            res.status(200).json({ message: 'Low inventory alert email sent successfully' });
        } else {
            res.status(200).json({ message: 'Inventory levels are sufficient' });
        }
    } catch (error) {
        console.error('Error checking inventory levels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
