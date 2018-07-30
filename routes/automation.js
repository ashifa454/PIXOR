const router=require('express').Router();
const pm2 =require('pm2');
router.post('/runFreePik',(req,res)=>{
    if(req.header.isAllowed){
        pm2.connect((err)=>{
            if(err){
                process.exit(2)
                res.json({
                    status:false,
                    message:err
                })
            }
            pm2.start({
                script:'./sourceCode/pixabat.js',
                exec_mode:'cluster',
                instances:4,
                max_memory_restart:'100M'
            },function(err,apps){
                pm2.disconnect();
                res.json({
                    status:false,
                    message:err
                })
            })
        });
    }
});