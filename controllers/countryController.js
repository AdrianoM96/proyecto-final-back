const Country = require('../models/Country');

const createCountry = async (req, res) => {
    const countryData = req.body;

    try {
        let countries;
        if (Array.isArray(countryData)) {

            countries = await Country.insertMany(countryData);
        } else {

            const country = new Country(countryData);
            countries = await country.save();
        }
        res.status(201).json(countries);
    } catch (error) {
        res.status(400).json({ message: 'Error creating country or countries', error });
    }
};

const getCountries = async (req, res) => {
    try {
        const countries = await Country.find();
        res.status(200).json(countries);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching countries', error });
    }
};

const getCountryById = async (req, res) => {
    const { id } = req.params;

    try {
        const country = await Country.findById(id);
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }
        res.status(200).json(country);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching country', error });
    }
};

const updateCountry = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const country = await Country.findById(id);
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }

        country.name = name || country.name;
        await country.save();
        res.status(200).json(country);
    } catch (error) {
        res.status(400).json({ message: 'Error updating country', error });
    }
};

const deleteCountry = async (req, res) => {
    const { id } = req.params;

    try {
        const country = await Country.findByIdAndDelete(id);
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }

        res.status(200).json({ message: 'Country removed' });

    } catch (error) {
        res.status(400).json({ message: 'Error deleting country', error });
    }
};

module.exports = {
    createCountry,
    getCountries,
    getCountryById,
    updateCountry,
    deleteCountry,
};
