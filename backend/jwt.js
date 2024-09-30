const express = require('express');
var cors = require('cors');
var jwt = require('jsonwebtoken');

const app = express();
app.use(cors())

const validation = (req,res,next) => {
  const token = req.headers['authorization'];
  if(!token){
    return res.status(401).send("Invalid authorization");
  }
  jwt.verify(token, "shhhhh", (error, user) => {
    if (error){
        return res.status(400).send(error);
    }
    req.user = user;
    next();
})

}

app.get('/signup',(req,res) => {

  var token = jwt.sign({ user: '123' }, 'shhhhh', { expiresIn: '1h' });

  return res.send(token)
})

app.get('/login',validation,(req,res) => {

  return res.send('logged in')
})


app.listen(3000, () => {console.log('3000 running on port')});
