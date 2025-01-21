import 'dotenv/config'
import MongoDB from './db/dbconnection.js'
import {app} from './app.js'
MongoDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`connection successfull on port: ${process.env.PORT}`);
    });
}).catch((error)=>{
   console.log("DB connetion faild");
});