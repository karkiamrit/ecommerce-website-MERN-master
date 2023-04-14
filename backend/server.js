const app=require('./app');
const dotenv=require('dotenv');
const connectDatabase=require('./config/database');

//Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log('Shutting down the server due to uncaught Exception');
    process.exit(1);
});
//-->uncaught exception bhaneko undefined variable use bhako ya aru kunai similar type of error ,surumai define garne ho yo 


//config
dotenv.config({path:"backend/config/config.env"})

//Connecting to database
connectDatabase();

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
});


//Unhandled Promise Rejection
process.on('unhandledRejection',err=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down server due to Unhandled Promise Rejection`)
    server.close(()=>{
        process.exit(1);
    });
});//jaile last ma define garne yo start bhayesi server
//yo bhaneko jaba promise resolve hunna taba dinxa like model ma name,ra address ko schema thyo bhane yedi address wala input nei gayena bhane aune error
//env ma db ko string galat lekhda ni same error auxa
//yesto error aye malaiforce server close garne ho beijat huna bata jogina :))
