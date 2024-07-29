const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    res.send('User Active');
})

module.exports = router;