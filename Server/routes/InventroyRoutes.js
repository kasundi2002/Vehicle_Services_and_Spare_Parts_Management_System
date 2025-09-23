const express = require('express');
const router = express.Router();
const Inventory = require('./models/InventoryModel');
const { sendEmail } = require('../services/emailService');

// Local security helpers for inventory routes
function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  return out;
}
function toPublicInventory(i) {
  return pick(i, ['_id', 'InventoryID', 'InventoryType', 'InventoryName', 'Vendor', 'UnitPrice', 'UnitNo', 'Description']);
}
const INTERNAL_ERROR = { error: 'Internal server error' };
function sanitizeError(err) {
  try { console.error(err && err.stack ? err.stack : err); } catch (_) {}
  return INTERNAL_ERROR;
}

router.post("/insertinventory", async (req, res) => {
    const { InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description } = req.body;

    try {
        // Create a new inventory item without specifying InventoryID
        const addInventory = new Inventory({ InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description });

        // Save the new inventory item
        await addInventory.save();

        return res.status(201).json(toPublicInventory(addInventory.toObject ? addInventory.toObject() : addInventory));
    } catch (err) {
        console.error("Error adding inventory:", err);
        return res.status(500).json(sanitizeError(err));
    }
});

router.get('/inventory', async (req, res) => {
    try {
        // Retrieve all inventory items
        const getInventory = await Inventory.find({}).lean();
        return res.status(200).json(getInventory.map(i => toPublicInventory(i)));
    } catch (err) {
        console.error("Error fetching inventory:", err);
        return res.status(500).json(sanitizeError(err));
    }
});

router.get('/inventory/:id', async (req, res) => {
    try {
        // Retrieve a specific inventory item by ID
        const getInventoryItem = await Inventory.findById(req.params.id).lean();
        if (!getInventoryItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        return res.status(200).json(toPublicInventory(getInventoryItem));
    } catch (err) {
        console.error("Error fetching inventory item:", err);
        return res.status(500).json(sanitizeError(err));
    }
});

router.put('/updateinventory/:id', async (req, res) => {
    try {
        // Update an inventory item by ID
        const { InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description } = req.body;
        const updateInventory = await Inventory.findByIdAndUpdate(req.params.id, { InventoryType, InventoryName, Vendor, UnitPrice, UnitNo, Description }, { new: true }).lean();
        if (!updateInventory) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        return res.status(200).json(toPublicInventory(updateInventory));
    } catch (err) {
        console.error("Error updating inventory:", err);
        return res.status(500).json(sanitizeError(err));
    }
});

router.delete('/deleteinventory/:id', async (req, res) => {
    try {
        // Delete an inventory item by ID
        const deleteInventoryItem = await Inventory.findByIdAndDelete(req.params.id).lean();
        if (!deleteInventoryItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        return res.status(200).json(toPublicInventory(deleteInventoryItem));
    } catch (err) {
        console.error("Error deleting inventory:", err);
        return res.status(500).json(sanitizeError(err));
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
        return res.status(500).json(sanitizeError(error));
    }
});

module.exports = router;
