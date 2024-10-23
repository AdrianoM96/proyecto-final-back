const PDFDocument = require('pdfkit-table');
const Product = require('../models/Product');
const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');
const Seller = require('../models/Seller')


const getReportData = async (reportType, año = null, fechaInicio = null, fechaFin = null) => {
    let headers = [];

    switch (reportType) {
        case 'stock':
            data = await getStockData();
            headers = ['Product Name', 'Size', 'Quantity'];
            break;
        case 'ventas':

            data = await getSalesData(año, fechaInicio, fechaFin);
            headers = ['Producto', "Talle", 'Cantidad vendida', "Precio unitario promedio", "Total vendido"];
            break;
        case 'productos':
            data = await getProductsData();
            headers = ['Product Name', 'Description', 'Price', 'Stock'];
            break;
        default:
            throw new Error('Invalid report type');
    }

    return { data, headers };
};

const getStockData = async () => {
    const products = await Product.find({}).populate({
        path: 'stocks',
        populate: {
            path: 'size',
            select: 'name',
        },
    });
    const stockData = products.flatMap(product =>
        product.stocks.map(stock => ({
            productName: product.name,
            size: stock.size ? stock.size.name : 'N/A',
            quantity: stock.quantity,
        }))
    );
    return stockData;
};


const getProductsData = async () => {
    const products = await Product.find({});
    const productData = products.map(product => ({
        productName: product.name,
        description: product.description,
        price: product.price,
        stock: product.stocks.length,
    }));
    return productData;
};

const getSalesData = async (año, fechaInicio, fechaFin) => {
    let query = {};


    if (fechaInicio && fechaFin) {
        query.updatedAt = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin),
        };
    }

    if (año && !fechaInicio && !fechaFin) {
        query.updatedAt = {
            $gte: new Date(`${año}-01-01T00:00:00.000Z`),
            $lte: new Date(`${año + 1}-01-01T00:00:00.000Z`)
        };
    }

    const orders = await Order.find(query)
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                select: 'name price',
            },
        });


    const salesDataMap = new Map();

    orders.forEach((order, index) => {
        order.orderItems.forEach(item => {
            const productName = item.product ? item.product.name : 'N/A';
            const size = item.size;
            const itemPrice = item.price;


            const key = `${productName} - ${size}`;


            if (!salesDataMap.has(key)) {
                salesDataMap.set(key, {
                    productName,
                    size,
                    quantitySold: 0,
                    totalRevenue: 0,
                    totalPrice: 0,
                    totalSalesCount: 0,
                    numeroVenta: `Venta ${index + 1}`,
                });
            }


            const entry = salesDataMap.get(key);
            entry.quantitySold += item.quantity;
            entry.totalRevenue += itemPrice * item.quantity;
            entry.totalPrice += itemPrice * item.quantity;
            entry.totalSalesCount += item.quantity;
        });
    });


    const salesData = Array.from(salesDataMap.values()).map(entry => {
        const averagePrice = entry.totalRevenue / entry.quantitySold;

        return {
            productName: entry.productName,
            size: entry.size,
            quantitySold: entry.quantitySold,
            price: `$${averagePrice.toFixed(2)}`,
            totalRevenue: `$${entry.totalRevenue.toFixed(2)}`,
        };
    });

    return salesData;
};



const buildPDF = async (dataFront, dataCallback, endCallback) => {

    const fechaInicioDate = new Date(dataFront.fechaInicio);
    const formattedDateInicio = fechaInicioDate.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });

    const fechaFinDate = new Date(dataFront.fechaFin);
    const formattedDateFin = fechaFinDate.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });

    try {
        if (dataFront.año && dataFront.año === 0) {
            throw new Error('Error al enviar el año');
        }

        const doc = new PDFDocument();

        doc.on("data", dataCallback);
        doc.on("end", endCallback);


        const { data, headers } = await getReportData(dataFront.reportType, dataFront.año, dataFront.fechaInicio, dataFront.fechaFin);

        const table = {
            title: `Reporte de ${dataFront.reportType.charAt(0).toUpperCase() + dataFront.reportType.slice(1)}`,
            subtitle: dataFront.fechaInicio && dataFront.fechaFinal
                ? `Fecha: de ${formattedDateInicio} a ${formattedDateFin}`
                : `Año: ${dataFront.año}`,
            headers: headers,
            rows: data.map(item => Object.values(item)),
        };

        await doc.table(table, { width: 300 });
        doc.end();
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        throw new Error("Hubo un problema al generar el PDF.");
    }
};


const buildFacturaPDF = async (dataFront, order) => {



    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    const outputPath = path.join(__dirname, '..', 'facturas', `factura-${order._id}.pdf`);
    const stream = fs.createWriteStream(outputPath);


    doc.pipe(stream);

    const alignRight = { align: 'right' };


    const seller = await Seller.findOne({ singleton: true });
    // if (!seller) {
    //     return res.status(404).json({ message: 'No se encontraron datos fiscales' });
    // }
    const dateNow = new Date();

    const formattedDate = dateNow.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });



    try {

        const imagePath = path.join(__dirname, '..', 'public', 'starman_750x750.png');
        doc.image(imagePath, 30, 30, { width: 75 });


        doc.fontSize(16).text(seller.name, 110, 30);
        doc.fontSize(10)
            .text(`Dirección:${seller.address}`, 110, 55)
            .text(`Dirección:${seller.city}`, 110, 70)
            .text(`Teléfono: ${seller.phone}`, 110, 85)
            .text(`Email: ${seller.email}`, 110, 100)
            .text(`${seller.condition}`, 110, 115);


        doc.rect(320, 30, 40, 40).stroke();
        doc.fontSize(30).text('C', 332, 35);


        doc.moveTo(340, 70).lineTo(340, 130).stroke();


        doc.fontSize(16).text('FACTURA B', 420, 30, alignRight);
        doc.fontSize(10)
            .text(`N°${order._id}`, 420, 55, alignRight)
            .text(`Fecha: ${formattedDate}`, 420, 70, alignRight)
            .text(`CUIT: ${seller.cuit}`, 420, 85, alignRight)
            .text(`IIBB: ${seller.iibb}`, 420, 100, alignRight)
            .text(`Inicio de Actividades: ${seller.activityStart}`, 420, 115, alignRight);


        doc.fontSize(12).text('INFORMACION DEL CLIENTE', 30, 150);
        doc.fontSize(10)
            .text(`Cliente: ${order.orderAddress.firstName} ${order.orderAddress.lastName}`, 30, 170)
            .text(`Dirección: ${order.orderAddress.address}`, 30, 185)
            .text(`DNI: ${order.orderAddress.city} - ${order.orderAddress.postalCode}`, 30, 200)
            .text(`Email: ${order.user.email}`, 30, 215)
            .text('Condición: CONSUMIDOR FINAL', 30, 230);


        doc.fontSize(12).text('CONDICIONES DE VENTA', 410, 150, alignRight);
        doc.fontSize(10)
            .text(`Condición de venta: ${dataFront.paymentMethod}`, 410, 170, alignRight)
            .text('Tipo: Producto', 410, 185, alignRight)
            .text(`Orden de compra: ${order._id}`, 410, 200, alignRight);


        const table = {
            title: "CONCEPTOS",
            headers: ["Cantidad", "Código", "Precio Unitario"],
            rows: order.orderItems.map((item) => [
                item.quantity,
                `${item.product.name} '${item.size}'`,
                `$ ${item.price.toFixed(2)}`,
            ])
        };

        await doc.table(table, {
            width: 535,
            x: 30,
            y: 250
        });


        const y = doc.y + 20;
        doc.text(`Subtotal: $ ${order.subTotal.toFixed(2)}`, 400, y, alignRight);
        doc.fontSize(14).text(`TOTAL: $ ${order.total.toFixed(2)}`, 400, y + 15, alignRight);

        doc.fontSize(12).text('OBSERVACIONES', 30, y + 45);
        doc.fontSize(10)
            .text(`Comprobante generado por ${dataFront.paymentMethod} pago con ID: ${dataFront.transactionId}`, 30, y + 60);

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });


        return { outputPath };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

const getOrderPDF = async (req, res) => {
    const { id } = req.params;

    try {
        const pdfPath = path.join(__dirname, '..', 'facturas', `factura-${id}.pdf`);

        if (fs.existsSync(pdfPath)) {
            res.contentType('application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.pdf`);
            fs.createReadStream(pdfPath).pipe(res);
        } else {
            res.status(404).json({ message: 'PDF not found for this order' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving PDF', error: error.message });
    }
};



module.exports = {
    buildPDF,
    buildFacturaPDF,
    getOrderPDF
};
