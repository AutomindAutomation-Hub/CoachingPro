const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname.replace(/ /g, '_')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Get materials for a batch
router.get('/:batchId', protect, async (req, res) => {
    try {
        const materials = await Material.find({ batchId: req.params.batchId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload a material document
router.post('/', protect, upload.single('document'), async (req, res) => {
    try {
        const { title, batchId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // Usually we would upload to S3/Cloudinary here, but we are using local /uploads folder
        const fileUrl = `/uploads/${req.file.filename}`;

        const material = await Material.create({
            title,
            batchId,
            uploadedBy: req.user._id,
            fileUrl,
            fileType: req.file.mimetype
        });

        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete material
router.delete('/:id', protect, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Not found' });

        // Additional check: maybe only uploader or admin can delete
        if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
