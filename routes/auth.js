const express = require('express');
const router = express.Router();
const User = require('../schema/user.schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const saltRounds = 10;

router.get('/',(req,res)=>{
    res.send("login page");
});

router.post('/register',async(req,res)=>{
    try{
        const {name, email, password} = req.body;
        const userExists =await User.findOne({email});
        if(userExists){
            return res.status(400).send('User already exists');
        }
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password,salt);
        const user = new User({
            name,
            email,
            password: hash
        });
        await user.save();  
        const token = jwt.sign({_id: user._id},process.env.TOKEN_SECRET);
        res.json({
            email: user.email,
            token
        })
    }
    catch(err){
        return new Error(e.message);
    }
    
});


router.post('/login',async(req,res)=>{
    try{
        const {email, password} = req.body;
        const userExists =await User.findOne({email});
        if(!userExists){
            return res.status(400).send('email or password is wrong');
        }
        const validPass = bcrypt.compareSync(password,userExists.password);
       
        if(!validPass){
            return res.status(400).send('email or password is wrong');
        }
        const token = jwt.sign({id: userExists._id},process.env.TOKEN_SECRET);
        res.json({
            email: userExists.email,
            token
        })
    }
    catch(err){
        return new Error(err.message);
    }
    
});



router.post('/updatePassword',async(req,res)=>{
    try{
        const {email, password,newPassword}=req.body;
        // console.log(req.headers);
        const token = req.headers['authorization'];
        // console.log(token);
        
        const userExists =await User.findOne({email});
       
        if(!userExists){
            return res.status(400).send('email or password is wrong');
            
        }
       
        const validPass = bcrypt.compareSync(password,userExists.password);
       
        if(!validPass){
            return res.status(400).send('email or password is wrong');
        }
       
       const verifiedToken = jwt.verify(token,process.env.TOKEN_SECRET);
    //    console.log(userExists._id.toString);
    //    console.log(verifiedToken.id);
    const userId = userExists._id.toString();
       if(verifiedToken.id !== userId){
            
            return res.status(401).send('Unauthorized');
       }
      
       const salt = bcrypt.genSaltSync(saltRounds);
       const hash = bcrypt.hashSync(newPassword,salt);
       await User.findOneAndUpdate({email: userExists.email},{password: hash});
       res.json({
        messlage: 'Password updated successfully'
       })

    }catch(error){
        return new Error(error.message)
    }
});





module.exports = router;
