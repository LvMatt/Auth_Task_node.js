const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required:true,
        unique: true,
        //unique: true,
       // required: 'true'
    },
    fullname: {
        type: String,
        required:true
      
    },
    password: {
        type: String,
        required:true,
    },
    dateOfBirth: {
        type: Number,
    },
    tokens: [{
        token: {
            type: String,
            //required: true
        }
    }]
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id : user._id.toString()}, 'mySecret')

    user.tokens = user.tokens.concat({token})
    await user.save();
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}


userSchema.pre('save', async function(next){
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema )

module.exports = User