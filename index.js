const express = require('express');
const bodyParser = require('body-parser');
const {Sequelize,  DataTypes, INTEGER } = require('sequelize');

const {db, Op } = require('./src/db/db');

const app = express();
app.use(express.json()); 

const routes = require('./src/routes');
const { default: axios } = require('axios');
const isAuthenticated = require('./src/controllers/authentication');

const PORT = process.env.PORT || 3000;

axios.defaults.baseURL = 'http://192.168.1.160:3000/';

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Ruta de iniciacion

app.get('/', (req, res)  => {
    res.send('Running Server to CRM comercial - Costa Center');
})

app.get('/sign/user/', isAuthenticated, (req, res) => {
  try {
    console.log(req.user);
    console.log('entra')
    res.status(200).json({user: req.user});
  }catch(err){
    console.log(err);
    res.status(500).json({msg: 'error en la principal'});
  }
})

app.use('/api', routes)



const server = app.listen(PORT, () => {
    db.sync({force: false}); 
    console.log(`Server running on port ${PORT}`);
});
   