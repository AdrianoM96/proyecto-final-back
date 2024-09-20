const ProductImage = require('../models/ProductImage');
const Product = require('../models/Product');

const createProductImage = async (req, res) => {
    const { images } = req.body;



    try {

        const productId = images[0].product;


        const product = await Product.findById(productId);


        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        const productImages = await Promise.all(
            images.map(async image => {
                const { url } = image;


                const productImage = new ProductImage({ url, product: productId });

                const imageSaved = await productImage.save();


                product.images.push(productImage._id);


                return productImage._id;
            })
        );


        await product.save();


        res.status(201).json({ message: 'Images created successfully', productImages });
    } catch (error) {
        res.status(400).json({ message: 'Error creating product image', error });
    }
};


const getProductImages = async (req, res) => {
    try {
        const images = await ProductImage.find().populate('product');
        res.status(200).json(images);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching product images', error });
    }
};

const getProductImageById = async (req, res) => {
    const { id } = req.params;

    try {
        const image = await ProductImage.findById(id).populate('product');
        if (!image) {
            return res.status(404).json({ message: 'Product image not found' });
        }
        res.status(200).json(image);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching product image', error });
    }
};

const updateProductImage = async (req, res) => {
    const { id } = req.params;
    const { url } = req.body;

    try {
        const image = await ProductImage.findById(id);
        if (!image) {
            return res.status(404).json({ message: 'Product image not found' });
        }

        image.url = url || image.url;
        await image.save();

        res.status(200).json(image);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product image', error });
    }
};

const deleteProductImage = async (req, res) => {
    const { id } = req.params;

    try {
        const image = await ProductImage.findByIdAndDelete(id);
        if (!image) {
            return res.status(404).json({ message: 'Product image not found' });
        }


        await Product.findByIdAndUpdate(image.product, {
            $pull: { images: id },
        });



        res.status(200).json({ message: 'Product image removed' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product image', error });
    }
};

module.exports = {
    createProductImage,
    getProductImages,
    getProductImageById,
    updateProductImage,
    deleteProductImage,
};
