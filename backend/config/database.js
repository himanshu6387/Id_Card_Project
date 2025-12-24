    import mongoose from "mongoose";

    const connectDB = async () => {
        try {
            mongoose.connect('mongodb+srv://himanshu_db_user:LXjlMT0cOTFVb1l7@cluster0.wphdsts.mongodb.net/?appName=Cluster0')
            console.log('MongoDB Connected Successfully..')
        } catch (error) {
            console.log(error)
        }
    }

    export default connectDB