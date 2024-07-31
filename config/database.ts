import mongoose from "mongoose";

const DBConnection = async () => {
    await mongoose.connect(process.env.DB!)
        .then(() => {
            console.log(`Database Connected to : ${process.env.DB}`);
        })
        .catch((err: Error) => {
            console.error(`Error Connecting to Database: ${err.message}`);
        });
};

export default DBConnection;