var express = require('express');
var app = express();
var path = require('path');
var exphbs = require('express-handlebars');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/doctor";
var util=require('util');
var io=require('socket.io').listen(server);
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));


//Authentication Packages
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


//Bodey Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(expressValidator());
//end view Engine for handlebars

app.use(cookieParser());

//session
app.use(session({
  secret: 'sdfksnfkgnskntdhdghrgnsjdhnsaklfjlkhashslkafj',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({url:'mongodb://localhost:27017/doctor'})
  //cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());
var coinbase = web3.eth.coinbase;
console.log(coinbase);
var balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));




// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

var server = app.listen(7086, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})


//  !!!!!!!!!!!!   very very important !!!!!!!!!!!    caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
//  !!!!!!!!!!!!   very very important !!!!!!!!!!!    caching disabled for every route


app.get('/doctor',authenticationMiddleware(), function (req, res1) {
  MongoClient.connect(url, function(err, db) {
  var result = [];
  var query = {'id':req.user};
  var display={'username':1,_id:0}
  var cursor = db.collection('register').find(query,display);
    cursor.forEach(function(doc, err) {
      result.push(doc);
    }, function() {
       res1.render('doctor',{user:result[0].username});
      db.close();
    })
  })
});


app.get('/', function (req, res) {
   res.render( 'login');
})

app.post('/doctors/search',authenticationMiddleware(), function(req,res){
  var result = [];
MongoClient.connect(url, function(err, db) {
  var qselect = req.body.search_categories;
  switch(qselect){
    case 'phoneNumber':
    var query = { 'phoneNumber': req.body.searchValue };
    break;
    case 'address1':
    var query = { 'address1': req.body.searchValue };
    break;
    case 'firstName':
    var query = { 'firstName': req.body.searchValue };
    break;
    case 'currentStatus':
    var query = { 'currentStatus': req.body.searchValue };
    break;
    case 'email':
    var query = { 'email': req.body.searchValue };
    break;
    case '':
    var query = {};
    break;
  }
var cursor = db.collection('create').find(query);
console.log(query);
  cursor.forEach(function(doc, err) {
    result.push(doc);
  }, function() {
    db.close();
        res.render('dashboard', {doctors: result,user:req.user});
  });
          });
});

app.get('/dashboard',authenticationMiddleware(), function (req, res) {

  res.render('dashboard');

});
passport.use(new LocalStrategy(
  function(username, password, done) {
    var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"fullIdentity","type":"string"},{"name":"username","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
    var Acc = AccContract.at(username);
    Acc.GetCount.call(function (error, Count){
    Acc.getAccount.call(Count-1,function(err, res){
    var one = new String(password);
    var two = new String(res[3]);
    if( one.valueOf() === two.valueOf()){
          const user_id=res[0];
          return done(null,user_id, {message: ' Successfully Authenticated'})
        }else {
        return done(null,false, {message:'!!! User Credentials are wrong !!!'})
        }
     });
   });

  }
));

app.post('/login',passport.authenticate('local', {successRedirect:'/doctor', failureRedirect:'/', badRequestMessage : 'Missing username or password.',
    failureFlash: true}), function (req, res1) {
})

app.post('/update',authenticationMiddleware(), function (req, res1) {
  var doctorAddress = req.body.updatedoctorAddress;
  var updatephoneNumber = req.body.updatephoneNumber;
  var updatecurrentStatus = req.body.updatecurrentStatus;
  var updateaddress = req.body.updateaddress;
  MongoClient.connect(url, function(err, db){
  var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"fullIdentity","type":"string"},{"name":"username","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

      var result = [];
      var  user=req.user;
      var query = {'id':user};
      var display={'contractAddress':1,_id:0}
      var cursor = db.collection('register').find(query,display);
        cursor.forEach(function(doc, err) {
          result.push(doc);
        }, function() {
          db.close();
              console.log(result[0].contractAddress);
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var entity = new String('entity');
  if(  new String(res[4]).valueOf() === entity.valueOf()){
    abidoctorContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"firstName","type":"string"},{"name":"SSN","type":"uint256"},{"name":"phoneNumber","type":"uint256"},{"name":"email","type":"string"},{"name":"specialty1","type":"string"},{"name":"address1","type":"string"},{"name":"currentStatus","type":"string"}],"name":"addNewDoctor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"phoneNumber","type":"uint256"},{"name":"address1","type":"string"},{"name":"currentStatus","type":"string"}],"name":"updateDoctor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getDoctor","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

    var doctorContract = abidoctorContract.at(doctorAddress);
  doctorContract.GetCount.call(function (error, Count){
  doctorContract.updateDoctor(Count-1, updatephoneNumber, updateaddress, updatecurrentStatus, {from:coinbase, gas: 4712388,
  gasPrice: 100000000000}, function(error){
  if(error){
     res1.render('doctor', {errors:'Error While updating doctor',user:req.user});
  }else {
    //socket
    MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var myquery = { "contractAddress": doctorAddress };
              var newvalues =  {$set:{ "currentStatus":updatecurrentStatus, "address1":updateaddress, "phoneNumber":updatephoneNumber } };
              db.collection("create").update(myquery, newvalues );
      });
    }
  })
});
MongoClient.connect(url, function(err, db) {
var result = [];
var query = {'id':req.user};
var display={'username':1,_id:0}
var cursor = db.collection('register').find(query,display);
  cursor.forEach(function(doc, err) {
    result.push(doc);
  }, function() {
        var io=require('socket.io').listen(server);
        io.sockets.on('connection',function(socket){
          socket.emit('update', {user1:result[0].username, address:doctorAddress, add1:updateaddress, phn: updatephoneNumber,sts:updatecurrentStatus});
        });
     res1.render('doctor',{ok:'Successfully updated doctor identity',user:result[0].username});
    db.close();
  })
})

}else{
    res1.render('doctor', {errors:'You dont have privilage to update doctor identity',user:req.user});
        }
    });
  });
});
});

});



app.post('/create', function (req, res1) {
  MongoClient.connect(url, function(err, db){
  var newfirstName = req.body.newfirstName;
  var newSSN = req.body.newSSN;
  var newphoneNumber = req.body.newphoneNumber;
  var newemail = req.body.newemail;
  var newspecialty = req.body.newspecialty;
  var newcurrentStatus = req.body.newcurrentStatus;
  var newaddress = req.body.newaddress;

  var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"fullIdentity","type":"string"},{"name":"username","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

      var result = [];
      var  user=req.user;
      var query = {'id':user};
      var display={'contractAddress':1,_id:0}
      var cursor = db.collection('register').find(query,display);
        cursor.forEach(function(doc, err) {
          result.push(doc);
        }, function() {
          db.close();
              console.log(result[0].contractAddress);
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var entity = new String('entity');
  if(  new String(res[4]).valueOf() === entity.valueOf()){
    abidoctorContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"firstName","type":"string"},{"name":"SSN","type":"uint256"},{"name":"phoneNumber","type":"uint256"},{"name":"email","type":"string"},{"name":"specialty1","type":"string"},{"name":"address1","type":"string"},{"name":"currentStatus","type":"string"}],"name":"addNewDoctor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"phoneNumber","type":"uint256"},{"name":"address1","type":"string"},{"name":"currentStatus","type":"string"}],"name":"updateDoctor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getDoctor","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

doctorCode=("60606040526000600160006101000a81548160ff021916908360ff160217905550341561002b57600080fd5b610d258061003a6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063083916b71461005e5780630ab93971146101d95780639a16ee7314610208578063f49a2051146102bd57600080fd5b341561006957600080fd5b6101d7600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001909190803590602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061051a565b005b34156101e457600080fd5b6101ec610696565b604051808260ff1660ff16815260200191505060405180910390f35b341561021357600080fd5b6102bb600480803560ff1690602001909190803590602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506106ad565b005b34156102c857600080fd5b6102e1600480803560ff16906020019091905050610747565b60405180806020018881526020018781526020018060200180602001806020018060200186810386528d818151815260200191508051906020019080838360005b8381101561033d578082015181840152602081019050610322565b50505050905090810190601f16801561036a5780820380516001836020036101000a031916815260200191505b5086810385528a818151815260200191508051906020019080838360005b838110156103a3578082015181840152602081019050610388565b50505050905090810190601f1680156103d05780820380516001836020036101000a031916815260200191505b50868103845289818151815260200191508051906020019080838360005b838110156104095780820151818401526020810190506103ee565b50505050905090810190601f1680156104365780820380516001836020036101000a031916815260200191505b50868103835288818151815260200191508051906020019080838360005b8381101561046f578082015181840152602081019050610454565b50505050905090810190601f16801561049c5780820380516001836020036101000a031916815260200191505b50868103825287818151815260200191508051906020019080838360005b838110156104d55780820151818401526020810190506104ba565b50505050905090810190601f1680156105025780820380516001836020036101000a031916815260200191505b509c5050505050505050505050505060405180910390f35b610522610b41565b8781600001819052508681602001818152505085816040018181525050848160600181905250838160800181905250828160a00181905250818160c00181905250428160e0018181525050428161010001818152505080600080600160009054906101000a900460ff1660ff16815260200190815260200160002060008201518160000190805190602001906105b9929190610bac565b50602082015181600101556040820151816002015560608201518160030190805190602001906105ea929190610bac565b506080820151816004019080519060200190610607929190610bac565b5060a0820151816005019080519060200190610624929190610bac565b5060c0820151816006019080519060200190610641929190610bac565b5060e0820151816007015561010082015181600801559050506001600081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff160217905550505050505050505050565b6000600160009054906101000a900460ff16905090565b826000808660ff16815260200190815260200160002060020181905550816000808660ff16815260200190815260200160002060050190805190602001906106f6929190610c2c565b50806000808660ff1681526020019081526020016000206006019080519060200190610723929190610c2c565b50426000808660ff1681526020019081526020016000206008018190555050505050565b61074f610cac565b60008061075a610cac565b610762610cac565b61076a610cac565b610772610cac565b6000808960ff1681526020019081526020016000206000016000808a60ff168152602001908152602001600020600101546000808b60ff168152602001908152602001600020600201546000808c60ff1681526020019081526020016000206003016000808d60ff1681526020019081526020016000206004016000808e60ff1681526020019081526020016000206005016000808f60ff168152602001908152602001600020600601868054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108b15780601f10610886576101008083540402835291602001916108b1565b820191906000526020600020905b81548152906001019060200180831161089457829003601f168201915b50505050509650838054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561094d5780601f106109225761010080835404028352916020019161094d565b820191906000526020600020905b81548152906001019060200180831161093057829003601f168201915b50505050509350828054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109e95780601f106109be576101008083540402835291602001916109e9565b820191906000526020600020905b8154815290600101906020018083116109cc57829003601f168201915b50505050509250818054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a855780601f10610a5a57610100808354040283529160200191610a85565b820191906000526020600020905b815481529060010190602001808311610a6857829003601f168201915b50505050509150808054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610b215780601f10610af657610100808354040283529160200191610b21565b820191906000526020600020905b815481529060010190602001808311610b0457829003601f168201915b505050505090509650965096509650965096509650919395979092949650565b61012060405190810160405280610b56610cc0565b81526020016000815260200160008152602001610b71610cc0565b8152602001610b7e610cc0565b8152602001610b8b610cc0565b8152602001610b98610cc0565b815260200160008152602001600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610bed57805160ff1916838001178555610c1b565b82800160010185558215610c1b579182015b82811115610c1a578251825591602001919060010190610bff565b5b509050610c289190610cd4565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610c6d57805160ff1916838001178555610c9b565b82800160010185558215610c9b579182015b82811115610c9a578251825591602001919060010190610c7f565b5b509050610ca89190610cd4565b5090565b602060405190810160405280600081525090565b602060405190810160405280600081525090565b610cf691905b80821115610cf2576000816000905550600101610cda565b5090565b905600a165627a7a72305820a49cd675307d2d59fb30119dd8f544a291739a160321177b541bc00dc1a79b7a0029");


abidoctorContract.new("", {from:coinbase, data: doctorCode, gas: 3000000},function(err, deployedContract){
   if(!err) {
      if(!deployedContract.address) {
          //console.log(deployedContract.transactionHash)
      } else {
          var doctorContract = abidoctorContract.at(deployedContract.address);
     doctorContract.addNewDoctor(newfirstName, newSSN, newphoneNumber, newemail, newspecialty, newaddress,newcurrentStatus, {from:coinbase, gas: 4712388,
 gasPrice: 100000000000}, function(error){
       if(error){
           res1.render('doctor', {errors:'Error While creating doctor',user:req.user});
       }else {
               MongoClient.connect(url, function(err, db) {
               if (err) throw err;
               var myobj = {
                  contractAddress:deployedContract.address,
                  phoneNumber: newphoneNumber,
                  address1: newaddress,
                  firstName: newfirstName,
                  currentStatus: newcurrentStatus,
                  email:newemail
               }
                db.collection("create").insertOne(myobj, function(err, doc) {
               if (err) {
                   throw err;
               }
               });
            });
          }
       })
     }
   }
 });
 res1.render('dashboard',{ok:'Successfully created doctor identity'});
}else{
    res1.render('doctor', {errors:'You dont have privilage to create doctor identity'});
        }
    });
  });
});
});

});
app.post('/register', function (req, res) {

    web3.eth.defaultAccount= coinbase;

  var id= req.body.id;
  var fullIdentity = req.body.fullIdentity;
  var username=req.body.username;
  var pass=req.body.password;
  var role=req.body.search_categories;
var abiContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"fullIdentity","type":"string"},{"name":"username","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
idCode = ("60606040526000600160006101000a81548160ff021916908360ff160217905550341561002b57600080fd5b6109278061003a6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630ab939711461005357806368a760ee146100825780636c3aa54d146101b157600080fd5b341561005e57600080fd5b61006661039b565b604051808260ff1660ff16815260200191505060405180910390f35b341561008d57600080fd5b6101af600480803590602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506103b2565b005b34156101bc57600080fd5b6101d5600480803560ff169060200190919050506104c8565b6040518086815260200180602001806020018060200180602001858103855289818151815260200191508051906020019080838360005b8381101561022757808201518184015260208101905061020c565b50505050905090810190601f1680156102545780820380516001836020036101000a031916815260200191505b50858103845288818151815260200191508051906020019080838360005b8381101561028d578082015181840152602081019050610272565b50505050905090810190601f1680156102ba5780820380516001836020036101000a031916815260200191505b50858103835287818151815260200191508051906020019080838360005b838110156102f35780820151818401526020810190506102d8565b50505050905090810190601f1680156103205780820380516001836020036101000a031916815260200191505b50858103825286818151815260200191508051906020019080838360005b8381101561035957808201518184015260208101905061033e565b50505050905090810190601f1680156103865780820380516001836020036101000a031916815260200191505b50995050505050505050505060405180910390f35b6000600160009054906101000a900460ff16905090565b6103ba6107e6565b8581604001818152505084816000018190525083816020018190525082816060018190525081816080018190525080600080600160009054906101000a900460ff1660ff168152602001908152602001600020600082015181600001908051906020019061042992919061082e565b50602082015181600101908051906020019061044692919061082e565b5060408201518160020155606082015181600301908051906020019061046d92919061082e565b50608082015181600401908051906020019061048a92919061082e565b509050506001600081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff16021790555050505050505050565b60006104d26108ae565b6104da6108ae565b6104e26108ae565b6104ea6108ae565b6000808760ff168152602001908152602001600020600201546000808860ff1681526020019081526020016000206000016000808960ff1681526020019081526020016000206001016000808a60ff1681526020019081526020016000206003016000808b60ff168152602001908152602001600020600401838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105f85780601f106105cd576101008083540402835291602001916105f8565b820191906000526020600020905b8154815290600101906020018083116105db57829003601f168201915b50505050509350828054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106945780601f1061066957610100808354040283529160200191610694565b820191906000526020600020905b81548152906001019060200180831161067757829003601f168201915b50505050509250818054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107305780601f1061070557610100808354040283529160200191610730565b820191906000526020600020905b81548152906001019060200180831161071357829003601f168201915b50505050509150808054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107cc5780601f106107a1576101008083540402835291602001916107cc565b820191906000526020600020905b8154815290600101906020018083116107af57829003601f168201915b505050505090509450945094509450945091939590929450565b60a0604051908101604052806107fa6108c2565b81526020016108076108c2565b81526020016000815260200161081b6108c2565b81526020016108286108c2565b81525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061086f57805160ff191683800117855561089d565b8280016001018555821561089d579182015b8281111561089c578251825591602001919060010190610881565b5b5090506108aa91906108d6565b5090565b602060405190810160405280600081525090565b602060405190810160405280600081525090565b6108f891905b808211156108f45760008160009055506001016108dc565b5090565b905600a165627a7a72305820e23af06eded8a4ef3cadd6952045ea8deef7d8257711306981769b2bc8d768170029");

 abiContract.new("", {from:coinbase, data: idCode, gas: 3000000},function(err, deployedContract){
    if(!err) {
       if(!deployedContract.address) {
           //console.log(deployedContract.transactionHash)
       } else {
           var identityContract = abiContract.at(deployedContract.address);
      identityContract.newAccount(id, fullIdentity, username, pass, role, {from:coinbase, gas: 4712388,
  gasPrice: 100000000000}, function(error){
        if(error){
            console.log(error);
            res.render('register', {errors:'Error While creating Identity '});
        }else {
                MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var myobj = {
                  contractAddress:deployedContract.address,
                   id: id,
                   fullIdentity: fullIdentity,
                   username: username,
                   role: role
                }
                 db.collection("register").insertOne(myobj, function(err, doc) {
                if (err) {
                    throw err;
                }
                else{
                res.redirect('/');
                }

                });
                });
           }
        })
    }
  }
  });
});

app.get('/register', function (req, res) {

  res.render('register');

});

app.get('/logout', function(req, res){
  //req.flash('success_msg', 'You are logged out');
	req.logout();
  req.session.destroy(function() {
  res.status(200).clearCookie('connect.sid', {path: '/'}).json({status: "Success"});
  res.redirect('/');
});

	res.redirect('/');
});
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});
function authenticationMiddleware () {
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
	    if (req.isAuthenticated()) return next();
	    res.redirect('/')
	}
}





//socket
