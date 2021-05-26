const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: 'Пользователь с такой почтой уже есть.'})

            const hashPassword = await bcrypt.hash(password, 12)

            const newUser = new Users({
                name, email, password: hashPassword
            })
            
            const accesToken = createAccessToken({id: newUser._id})
            const refreshToken = createRefreshToken({id: newUser._id})

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            await newUser.save()

            res.json({msg: accesToken, refreshToken, newUser})
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    login: async (req, res) => {
        try {
            const {email, password} = req.body

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: 'Пользователь с такой почтой нет'})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: 'Неправильный пароль.'})
            
            const accesToken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })
            res.json({accesToken})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },  
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
            return res.json({msg: 'Logged out'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },  
    refreshToken: async (req, res) => {
        const rf_token = req.cookies.refreshtoken
        try {
            if(!rf_token) return res.status(400).json({
                msg: 'Пожалуйства войдите или зарегистрируйтесь'
            })
            return jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) => {
                if(err) return res.status(400).json({msg: 'Пожалуйства войдите или зарегистрируйтесь'})
                const accestoken = createAccessToken({id: user.id})
                res.json({accestoken})
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')
            if(!user) return res.status(400).json({msg: "Такого пользователя нет"})

            return res.json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },  
}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '15m'})
}
const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN, {expiresIn: '15m'})
}

module.exports = userCtrl