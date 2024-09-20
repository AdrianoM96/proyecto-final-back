const express = require('express');
const router = express.Router();
const {
    createSubCategory,
    getSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory
} = require('../controllers/subCategoryController');

router.get('/', getSubCategories);
router.get('/:id', getSubCategoryById);
router.post('/', createSubCategory);
router.put('/:id', updateSubCategory);

router.delete('/:id', deleteSubCategory);

module.exports = router;
