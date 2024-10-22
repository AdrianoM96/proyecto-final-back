

const Product = require('../models/Product');
const Stock = require('../models/ProductStock');
const Size = require('../models/ProductSize');
const Category = require('../models/Category');




const manageStocks = async (productId, stocks, previousStocks) => {


    let savedStocks = [];
    try {

        await Product.findByIdAndUpdate(productId, { stocks: [] });
        await Stock.deleteMany({ product: productId });


        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {

            return;
        }



        const sizeNames = stocks.map(stock => stock.size.name)
        const sizes = await Size.find({ name: { $in: sizeNames } });

        const sizeMap = new Map(sizes.map(size => [size.name, size._id]));


        const stockPromises = stocks.map(async (stock) => {
            const sizeId = sizeMap.get(stock.size.name);
            if (!sizeId) {

                return null;
            }

            const newStock = new Stock({
                product: productId,
                size: sizeId,
                quantity: stock.quantity
            });


            return newStock.save();
        });

        savedStocks = await Promise.all(stockPromises);
        const validSavedStocks = savedStocks.filter(stock => stock !== null);


        const stockIds = validSavedStocks.map(stock => stock._id);
        await Product.findByIdAndUpdate(productId, { stocks: stockIds });


    } catch (error) {
        console.error("Error al manejar los stocks:", error);


        await rollbackStocks(productId, previousStocks);
        throw new Error("Error al gestionar los stocks. Rollback realizado.");
    }
};

const rollbackStocks = async (productId, previousStocks) => {
    try {


        await Stock.deleteMany({ product: productId });


        const restoredStockPromises = previousStocks.map(stock => new Stock(stock).save());
        await Promise.all(restoredStockPromises);

        const stockIds = previousStocks.map(stock => stock._id);
        await Product.findByIdAndUpdate(productId, { stocks: stockIds });

    } catch (rollbackError) {
        console.error("Error al realizar el rollback de los stocks:", rollbackError);
    }
};


const getSizeIdMap = async () => {
    const sizes = await Size.find({});
    const sizeIdMap = {};
    sizes.forEach(size => {
        sizeIdMap[size.name] = size._id;
    });
    return sizeIdMap;
};



const createProduct = async (req, res) => {
    const { name, description, price, category, subCategory, images, stocks, gender } = req.body;

    const sizeIdMap = await getSizeIdMap();
    const allSizeNames = Object.keys(sizeIdMap);
    const stocksMap = {};
    let savedProduct;
    let previousStocks;

    try {

        const product = new Product({
            name,
            description,
            price,
            category,
            subCategory,
            images,
            gender
        });

        savedProduct = await product.save();



        previousStocks = await Stock.find({ product: savedProduct._id });



        allSizeNames.forEach(sizeName => {
            stocksMap[sizeName] = {
                quantity: 0,
                size: { name: sizeName },
                productId: null
            };
        });

        stocks.forEach(stock => {
            const sizes = Array.isArray(stock.size) ? stock.size : [stock.size];
            sizes.forEach(sizeName => {
                if (stocksMap[sizeName]) {
                    stocksMap[sizeName] = {
                        quantity: stock.quantity,
                        size: { name: sizeName }
                    };
                }
            });
        });

        const transformedStocks = Object.values(stocksMap);


        await manageStocks(savedProduct._id, transformedStocks);



        await Category.findByIdAndUpdate(
            category,
            { $push: { products: savedProduct._id } },
            { new: true }
        );



        res.status(201).json(savedProduct);

    } catch (error) {
        console.error("Error durante la creación del producto:", error);

        try {
            if (savedProduct) {

                await rollbackStocks(savedProduct._id, previousStocks);


                await Product.findByIdAndDelete(savedProduct._id);

                await ProductImage.deleteMany({ product: savedProduct._id });

            }
        } catch (rollbackError) {
            console.error("Error durante el rollback:", rollbackError);
        }

        res.status(400).json({ message: 'Error creating product', error });
    }
};



const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);
        const startIndex = (page - 1) * limit;
        const gender = req.query.gender || null;
        const search = req.query.search || null;
        const categoryName = req.query.category || null;



        let query = {};
        if (gender) {
            query.gender = gender;
        }


        let categoryId = null;
        if (categoryName) {
            const category = await Category.findOne({ name: categoryName });
            if (category) {
                categoryId = category._id;
                query.category = categoryId;
            }
        }


        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query)
            .skip(startIndex)
            .limit(limit)
            .populate('category')
            .populate('subCategory')
            .populate({
                path: 'stocks',
                populate: { path: 'size' }
            })
            .populate({
                path: 'images',
                select: '_id url'
            });

        const totalProducts = await Product.countDocuments(query);

        if (!products || products.length === 0) {

            return res.status(404).json({ message: "No products found" });
        }

        const totalPages = Math.ceil(totalProducts / limit);
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        const formattedProductsForAll = products.map(product => ({
            ...product.toObject(),
            images: product.images.map(image => image.url)
        }));

        const formattedProductsAdm = products.map(product => ({
            ...product.toObject(),
            images: product.images.map(image => ({
                _id: image._id,
                url: image.url
            })),
            stocks: product.stocks.sort((a, b) => {
                const sizeA = a.size.name.toUpperCase();
                const sizeB = b.size.name.toUpperCase();
                return sizeOrder.indexOf(sizeA) - sizeOrder.indexOf(sizeB);
            })
        }));


        res.status(200).json({
            currentPage: page,
            totalPages,
            products: formattedProductsForAll,
            productsAdmin: formattedProductsAdm
        });

    } catch (error) {
        console.error("Error fetching products", error);
        res.status(400).json({ message: 'Error fetching products', error });
    }
};



const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id)
            .populate('category')
            .populate('subCategory')
            .populate({
                path: 'stocks',
                populate: { path: 'size' }
            });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching product', error });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, subCategory, images, stocks, gender, isPaused } = req.body;



    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const originalProduct = {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            subCategory: product.subCategory,
            images: product.images,
            gender: product.gender,
            isPaused: product.isPaused,
        };



        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.images = images || product.images;
        product.gender = gender || product.gender;
        product.isPaused = isPaused;




        const updatedProduct = await product.save();

        if (product.category !== originalProduct.category) {

            if (originalProduct.category) {
                await Category.findByIdAndUpdate(
                    originalProduct.category,
                    { $pull: { products: updatedProduct._id } }
                );
            }


            if (updatedProduct.category) {
                await Category.findByIdAndUpdate(
                    updatedProduct.category,
                    { $push: { products: updatedProduct._id } }
                );
            }
        }

        try {
            await manageStocks(updatedProduct._id, stocks);

            res.status(200).json(updatedProduct);
        } catch (error) {


            Object.assign(product, originalProduct);
            await product.save();


            if (originalProduct.category) {
                await Category.findByIdAndUpdate(
                    originalProduct.category,
                    { $push: { products: updatedProduct._id } }
                );
            }
            if (updatedProduct.category) {
                await Category.findByIdAndUpdate(
                    updatedProduct.category,
                    { $pull: { products: updatedProduct._id } }
                );
            }

            res.status(400).json({ message: 'Error updating stocks, product reverted', error });
        }

    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error });
    }
};


const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        await Stock.deleteMany({ product: product._id });

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error });
    }
};







module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};

