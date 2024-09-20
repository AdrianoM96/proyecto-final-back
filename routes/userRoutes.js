const express = require('express');
const router = express.Router();
const {
    getPaginatedAllUser,
    getAllUsers,
    getUserById,
    createUser,
    updatePasswordUser,
    updateRoleUser,
    deleteUser
} = require('../controllers/userController');



router.get('/:id', getUserById);
router.get('/', getPaginatedAllUser);
router.post('/', createUser);
router.put('/password/:id', updatePasswordUser);
router.put('/role/:id', updateRoleUser);
router.delete('/:id', deleteUser);

module.exports = router;
