const express = require('express');
const router = express.Router();
const jobSchema = require('../schema/job.schema');

router.post('/',async(req,res,next)=>{
    try{
        const jobInfo = req.body;
        const skills = jobInfo?.skills?.split(',')||[];
        const newSkills = skills?.map(skill=> skill.trim());
        jobInfo.skills = newSkills;
        jobInfo.remote = jobInfo.remote=== 'true';
        const user = req.user;
        jobInfo.userId = user.id;
        const job = new jobSchema(jobInfo);
        await job.save();
        // job.save().then(()=>{
        //     res.status(201).json(job);
        // }).catch((e)=>{
        //     next(e.message); 
        // })
        res.json(job).status(200); 
    }
    catch(e){
        // throw new Error(e.message);
        // console.log(e.message);
        next(e.message);
    }
});



router.get('/:id',async(req,res,next)=>{
    try{
        const id = req.params.id;
        const job = await jobSchema.findById(id);
        if(!job){
            return res.status(404).json({message: 'Job not found'});
        }
        
        res.json(job).status(200);
    }   
    catch(e){
        next(e.message);
    }
})


router.delete('/:id',async(req,res,next)=>{
    try{
        const id = req.params.id;
        const job = await jobSchema.findById(id);
        if(!job){
            return res.status(404).json({message: 'Job not found'});
        }
        if(job.userId.toString() !== req.user.id ){
            return res.status(403).json({message: 'You are not authorized to delete this job'})
        }
        await jobSchema.findByIdAndDelete(id);
        res.json({message: 'Job deleted successfully'});
    }   
    catch(e){
        next(e.message);
    }
})


//filter and update
router.post('/:id',async(req,res,next)=>{
    try{
        const id = req.params.id;
        const job = await jobSchema.findById(id);
        if(!job){
            return res.status(404).json({message: 'Job not found'});
        }
        if(job.userId.toString() !== req.user.id ){
            return res.status(403).json({message: 'You are not authorized to update the job'})
        }
        const jobInfo = req.body;
        const newSkills = jobInfo?.skills?.split(',')||[];
        jobInfo.skills = newSkills;
        jobInfo.remote = jobInfo.remote === 'true';
        const updatedJob= await jobSchema.findByIdAndUpdate(id,jobInfo,{
            runValidators: true,  //run validators on update
            new: true       ///return the updated document instead of the original
        });
        res.status(200).json(updatedJob);

    }
    catch(e){
        next(e);
    }
});


//filter
//1. no filter
//2. filter by skills
//3. filter by keywords

router.get('/',async(req,res,next)=>{
    try{
        const {skills, keywords}=req.query;  //skills filter or keywords query 
        const filter = {};
        if(skills){
            const skillsArray = skills.split(',').map(skill=>skill.trim());
            filter.skills = {$in: skillsArray};
        }
        if(keywords){
            filter.$text = {$search: keywords};
        }
        const jobs = await jobSchema.find(filter);
        res.json(jobs);
    }catch(e){
        next(e);
    }
})

module.exports = router;