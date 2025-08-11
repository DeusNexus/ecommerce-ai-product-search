const express = require("express");
const { aiSearch } = require("../controllers/aiSearchController");

const router = express.Router();

router.post("/ai-search", aiSearch);

module.exports = router;
