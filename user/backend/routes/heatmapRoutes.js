const express = require("express");

const router =
    express.Router();


const heatmapController =
    require("../controllers/heatmapController");


// ======================================================
// GET HEATMAP DATA
// ======================================================

router.get(
    "/",
    heatmapController.getHeatMapData
);


module.exports = router;