import mongoose from "mongoose";

const DBConnection = () => {
    mongoose.connect(process.env.DB!)
        .then(() => {
            console.log(`Database Connected to : ${process.env.DB}`);
        })
};

export default DBConnection;