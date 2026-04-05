    import mongoose from "mongoose";

    const connectDB = async () => {
        try {
            // mongoose.connect('mongodb://himanshu_db_user:Himanshu123@cluster0.wphdsts.mongodb.net/idcardDB?retryWrites=true&w=majority&appName=Cluster0')
            // mongoose.connect('mongodb://himanshu_db_user:LXjlMT0cOTFVb1l7@cluster0.wphdsts.mongodb.net/?appName=Cluster0')
            mongoose.connect('mongodb+srv://ravitejasmartbridge_db_user:q7NozX2FeDDyYibp@idcardproject.lxhpbiz.mongodb.net/?appName=IdCardProject')
            // mongoose.connect('mongodb://localhost:27017/id_Card')
            console.log('MongoDB Connected Successfully..')
        } catch (error) {
            console.log(error)
        }
    }

    export default connectDB