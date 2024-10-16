const PDFDocument = require('pdfkit');

function buildPDF(dataCallback, endCallback) {
    const doc = new PDFDocument();

    doc.on("data", dataCallback);
    doc.on("end", endCallback);
    doc.fontSize(25).text("Some title from PDF Kit");
    const table = {
        title: "Title",
        subtitle: "Subtitle",
        headers: ["Country", "Conversion rate", "Trend"],
        rows: [
            ["Switzerland", "12%", "+1.12%"],
            ["France", "67%", "-0.98%"],
            ["England", "33%", "+4.44%"],
        ],
    };

    doc.table(table, {
        width: 300,
    });


    doc.end();
}
module.exports = { buildPDF };