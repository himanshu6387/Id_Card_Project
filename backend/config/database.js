    import mongoose from "mongoose";

    const connectDB = async () => {
        try {
            // mongoose.connect('mongodb://himanshu_db_user:Himanshu123@cluster0.wphdsts.mongodb.net/idcardDB?retryWrites=true&w=majority&appName=Cluster0')
            // mongoose.connect('mongodb://himanshu_db_user:LXjlMT0cOTFVb1l7@cluster0.wphdsts.mongodb.net/?appName=Cluster0')
            mongoose.connect('mongodb://ravitejasmartbridge_db_user:q7NozX2FeDDyYibp@ac-qi77l0p-shard-00-00.lxhpbiz.mongodb.net:27017,ac-qi77l0p-shard-00-01.lxhpbiz.mongodb.net:27017,ac-qi77l0p-shard-00-02.lxhpbiz.mongodb.net:27017/?ssl=true&replicaSet=atlas-11z8tu-shard-0&authSource=admin&appName=IdCardProject')
            // mongoose.connect('mongodb://localhost:27017/id_Card')
            console.log('MongoDB Connected Successfully..')
        } catch (error) {
            console.log(error)
        }
    }

    export default connectDB