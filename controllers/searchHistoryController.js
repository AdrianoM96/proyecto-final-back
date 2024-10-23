const SearchHistory = require('../models/SearchHistory');
const cron = require('node-cron');

const saveSearchHistory = async (req, res) => {
    const { search } = req.query;
    const { userId } = req.body;

    try {

        if (search && search.trim() !== '') {

            const history = new SearchHistory({
                user: userId,
                searchQuery: search,
            });
            await history.save();


            res.status(201).json({ message: 'Búsqueda guardada exitosamente' });
        } else {
            res.status(400).json({ message: 'La búsqueda no puede estar vacía' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar la búsqueda', error });
    }
};

const getSearchHistory = async (req, res) => {
    const { userId } = req.query;
    try {
        const history = await SearchHistory.find({ user: userId })
            .sort({ createdAt: -1 });

        const searchQueries = history.map(item => item.searchQuery);


        res.status(200).json({ history: searchQueries });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial de búsqueda', error });
    }
};

const deleteOldSearchHistory = async () => {
    try {

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 15);

        const result = await SearchHistory.deleteMany({ createdAt: { $lt: dateLimit } });

    } catch (error) {
        console.error('Error al eliminar historiales de búsqueda:', error);
    }
};

cron.schedule('0 0 */15 * *', () => {

    deleteOldSearchHistory();
});

module.exports = {
    saveSearchHistory,
    getSearchHistory,
};
