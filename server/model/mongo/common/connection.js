/**
 * Created by Ada on 2015/5/10.
 */
var mongoose=require('mongoose');
mongoose.Promise=Promise

//var url='mongodb://localhost/ss';
var url='mongodb://localhost/finance';
var options={db: { native_parser: true }};
var dbFinance=mongoose.createConnection(url,options)
//dbFinance.Promise = Promise
dbFinance.on('error',console.error.bind(console,'connection error'))
dbFinance.on('connected',function(){
    console.log('finance connected')
})

module.exports={
    dbFinance
}
/*mongoose.connect(url,options);
mongoose.connection.on('error',console.error.bind(console, 'connection error:'))
mongoose.connection.on('connected',function(){
    mongoose.Promise = Promise
    exports.mongoose=mongoose;
    console.log('ready')})*/

//mongoose.connection.on('error',new error('test'));
//mongoose.connection.once('open',function(cb){});
//new error('db not start');



//exports.mongoose=mongoose;
//exports.schemaOptions=schemaOptions;
