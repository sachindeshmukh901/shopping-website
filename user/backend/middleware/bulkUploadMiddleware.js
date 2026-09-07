const multer = require("multer");


// ========================================
// STORE EXCEL FILE IN MEMORY
// ========================================

let storage = multer.memoryStorage();


// ========================================
// FILE FILTER
// ========================================

let fileFilter = (req, file, cb) => {

    let allowedExtensions = [
        ".xlsx",
        ".xls",
        ".csv"
    ];

    let extension =
        "." +
        file.originalname
            .split(".")
            .pop()
            .toLowerCase();


    if (!allowedExtensions.includes(extension)) {

        return cb(
            new Error(
                "Only XLSX, XLS or CSV files are allowed"
            )
        );

    }


    cb(null, true);

};


// ========================================
// MULTER
// ========================================

let bulkUpload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


module.exports = bulkUpload;