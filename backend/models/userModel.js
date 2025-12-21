import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: 
    {
        type: String,
        required: true,
        unique: true
    },
    password:
     {
        type: String,
        required: true
    },
    role: 
    {
        type: String,
        enum: ['admin', 'college'],
        required: true
    },
    collegeName: 
    {
        type: String,
        required: function () {
            return this.role === 'college';
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.role === 'college';
        }
    }
},{timestamps: true});

const User = mongoose.model('User',userSchema)
export default User