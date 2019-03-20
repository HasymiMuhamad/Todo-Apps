const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Ajv = require('ajv');
const mongoose = require('mongoose');
const memberValidate = require('../scheme/user');
//var User = mongoose.model('User'); 
var jwt = require('jsonwebtoken');
const userSchema = require('../scheme/user.json');
require('dotenv').config()




exports.userCreate = function(req, res, next){
    console.log(req.body);
    let user = new User(
        {
           // name : req.body.name,
            username : req.body.username,
            email : req.body.email,
            password : req.body.password
        });

        var ajv = new Ajv();
        const valid = ajv.validate(userSchema, user);

        if (valid){
            console.log('User is valid!');
            bcrypt.hash(user.password, saltRounds) .then(function(hash){
                user.password = hash
                user.save()
                .then(function() {
                    const payload = {
                        id: user._id,
                        username: user.username
                    }
                    const token = jwt.sign(payload, 'jwtsecret', {
                        algorithm: 'HS256'
                    });
                    res.status(400).json({
                        token : token,
                        body: user,
                    })
                })
                .catch((err) => {
                    res.send({ message : 'Data Invalid', error : err});
                });
            });
        } else{
            console.log('User data is invalid', validate.errors);
            res.status(400)
            res.send({ message : 'Data Invalid', error : validate.errors});

        }

}


exports.Test = function(req, res, next){
    res.json({message : "connection succes"});
    next();
}



exports.authentication = (req, res) =>{
    const token = req.headers.authorization;
    jwt.verify(token, 'jwtsecret', function(err, decoded) {
        if (err) {
            return res.status(400).json({
                message: err
            })
        }

        console.log(decoded);
        const userId = decoded.id;
        User.findById(userId, function(err, user) {
            if (err) {
                return res.status(400).json({
                    message: err
                })
            }

            return res.status(200).json({
                body: user
            })
        })
    });

}