const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { Shipment } = require('../models/Shipment');

// CREATE a new shipment
router.post('/', async (req, res) => {
  const { /* shipmentDetails */ } = req.body; // Add necessary fields for a Shipment

  try {
    const newShipment = await Shipment.create({ /* ...shipmentDetails */ });
    res.status(201).json(newShipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// READ all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.findAll();
    res.status(200).json(shipments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve shipments' });
  }
});

// READ a single shipment by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await Shipment.findByPk(id);
    if (shipment) {
      res.status(200).json(shipment);
    } else {
      res.status(404).json({ error: 'Shipment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve shipment' });
  }
});

// UPDATE a shipment by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { /* updatedShipmentDetails */ } = req.body; // Add necessary fields for updating

  try {
    const [updated] = await Shipment.update({ /* ...updatedShipmentDetails */ }, {
      where: { id: id },
    });

    if (updated) {
      const updatedShipment = await Shipment.findByPk(id);
      res.status(200).json(updatedShipment);
    } else {
      res.status(404).json({ error: 'Shipment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// DELETE a shipment by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Shipment.destroy({
      where: { id: id },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Shipment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

module.exports = router;