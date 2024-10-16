const Seller = require('../models/Seller');


const updateSeller = async (sellerData) => {
    try {
        const seller = await Seller.findOneAndUpdate(
            { singleton: true },
            sellerData,
            { new: true }
        );

        if (!seller) {
            return { status: 404, message: 'No se encontraron datos fiscales para actualizar.' };
        }

        return { status: 200, message: 'Datos fiscales actualizados exitosamente.', data: seller };
    } catch (error) {
        return { status: 400, message: 'Error al actualizar los datos fiscales', error };
    }
};

const addSeller = async (req, res) => {
    const sellerData = req.body;

    try {


        const existingSeller = await Seller.findOne({ singleton: true });
        if (existingSeller) {

            const result = await updateSeller(sellerData);
            return res.status(result.status).json({ message: result.message, data: result.data });
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




module.exports = {
    addSeller,
    getSeller,
    updateSeller,
};
