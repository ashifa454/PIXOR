const express=require('express');
var dataApi=require('./routes/pixorApi');
var connectionApi=require('./routes/collectionApi');
var userApi=require('./routes/userArea');
var empApi=require('./routes/empApi');
const mongoose=require('mongoose');
var config=require('./config/database')
var cors=require('cors');
const bodyparser=require('body-parser');

//Decleration 
var app=express();
app.use(cors())
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended:true
}));
mongoose.connect(config.database,{
    config:{
        autoIndex:false
    }
});
mongoose.connection.on('connected',()=>{
    console.log("Connected");
    return;
})
mongoose.connection.on('error',(err)=>{
    console.log(err);
})
app.use('/data',dataApi)
app.use('/collection',connectionApi);
app.use('/user',userApi);
app.use('/emp',empApi);
app.get('/',(req,res)=>{
    res.send("HELLO WORLD");
});
app.listen(process.env.PORT,function(){
    console.log(process.env.PORT)
})