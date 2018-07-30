var casper=require('casper').create();
casper.then(()=>{
    console.log("HELLO WORLD");
})
casper.run();