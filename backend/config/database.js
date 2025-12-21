import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // mongoose.connect('mongodb://localhost:27017/Id_card')
        // mongoose.connect('mongodb+srv://mishrahimanshu8423_db_user:7AA5ll9pbi9ACxZ5@cluster0.ezz14z1.mongodb.net/?appName=Cluster0')
        mongoose.connect('mongodb+srv://abhiranjanms5646:8aCB8YwojAA5jq6z@cluster1.3acwtwk.mongodb.net/college-form?retryWrites=true&w=majority&appName=Cluster1')
        console.log('MongoDB Connected Successfully..')
    } catch (error) {
        console.log(error)
    }
}

export default connectDB