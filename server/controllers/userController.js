const User = require("../models/user");
const jwtHelper = require("../helpers/jwtHelper");
const hashHelper = require("../helpers/hashHelper");

class UserController {
    static deleteCart(req, res, next) {
        User.findByIdAndUpdate(req.user.id,
            { $pull: { cart: req.params.id } })
            .then(user => {
                res.status(201).json(user);
            })
            .catch(next)
    }
    static getCart(req, res, next) {
        User.findById(req.user.id)
            .populate('cart')
            .then(user => {
                res.status(200).json(user.cart);
            })
            .catch(next)
    }
    static addCart(req, res, next) {
        User.findByIdAndUpdate(req.user.id,
            { $push: { cart: req.params.id } })
            .then(user => {
                res.status(201).json(user);
            })
            .catch(next)
    }
    static register(req, res, next) {
        User.findOne({
            email: req.body.email
        })
            .then(user => {
                if (user) {
                    throw {
                        name: 'ValidationError',
                        message: 'Validation Error',
                        resp: [`E-mail already registered`]
                    }
                }
                return User.findOne({
                    username: req.body.username
                })
            })
            .then(user => {
                if (user) {
                    throw {
                        name: 'ValidationError',
                        message: 'Validation Error',
                        resp: [`Username already registered`]
                    }
                }
                return User.create({
                    email: req.body.email,
                    password: req.body.password,
                    username: req.body.username,
                    privilege: 'customer',
                    cart: []
                })
            })
            .then(user => {
                res.status(201).json(user);
            })
            .catch(next)
    }

    static login(req, res, next) {
        if (!req.body.email) {
            throw {
                status: 400,
                name: 'Validation Error',
                message: 'Please enter your email',
            }
        }
        if (!req.body.password) {
            throw {
                status: 400,
                name: 'Validation Error',
                message: 'Please enter your password',
            }
        }
        User.findOne({
            email: req.body.email
        })
            .then(user => {
                if (hashHelper.compare(req.body.password, user.password)) {
                    let token = jwtHelper.generate({ id: user.id, privilege: user.privilege });
                    res.status(200).json({ token });
                }
                else {
                    throw {
                        status: 401,
                        name: 'Validation Error',
                        message: 'Incorrect password',
                    }
                }
            })
            .catch(next)
    }
}

module.exports = UserController;