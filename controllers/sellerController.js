const Seller = require('../models/Seller');


const addSeller = async (req, res) => {
    const sellerData = req.body;

    try {

        const existingSeller = await Seller.findOne({ singleton: true });
        if (existingSeller) {
            return res.status(400).json({ message: 'Ya existe un registro de datos fiscales. Solo puede existir uno.' });
        }


        const seller = new Seller(sellerData);
        const savedSeller = await seller.save();

        res.status(201).json({ message: 'Datos fiscales creados exitosamente.', data: savedSeller });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear los datos fiscales', error });
    }
};


const getSeller = async (req, res) => {
    try {

        const seller = await Seller.findOne({ singleton: true });
        if (!seller) {
            return res.status(404).json({ message: 'No se encontraron datos fiscales.' });
        }

        res.status(200).json(seller);
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener los datos fiscales', error });
    }
};


const updateSeller = async (req, res) => {
    const updatedData = req.body;

    try {

        const seller = await Seller.findOneAndUpdate(
            { singleton: true },
            updatedData,
            { new: true }
        );

        if (!seller) {
            return res.status(404).json({ message: 'No se encontraron datos fiscales para actualizar.' });
        }

        res.status(200).json({ message: 'Datos fiscales actualizados exitosamente.', data: seller });
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar los datos fiscales', error });
    }
};

module.exports = {
    addSeller,
    getSeller,
    updateSeller,
};
