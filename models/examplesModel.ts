import mongoose from 'mongoose';
import {Examples} from '../interfaces/examples';

const examplesSchema: mongoose.Schema = new mongoose.Schema<Examples>({
    name: {type: String, required: true, trim: true},
    cover: String,
    images: [String]
}, {timestamps: true});

const imageUrl = (document: Examples): void => {
    if (document.cover) {
        const imageUrl: string = `${process.env.BASE_URL}/Examples/${document.cover}`;
        document.cover = imageUrl;
    }
    if (document.images) {
        const imagesList: string[] = [];
        document.images.forEach((image: string): void => {
            const imageUrl: string = `${process.env.BASE_URL}/Examples/${image}`;
            imagesList.push(imageUrl);
        });
        document.images = imagesList;
    }
};

examplesSchema.post('init', (document: Examples): void => {
    imageUrl(document);
}).post('save', (document: Examples): void => {
    imageUrl(document);
});

// examplesSchema.pre<Examples>(/^find/, function (next) {
//     this.populate({ path: 'category', select: 'name_en name_ar' });
//     next();
// });

export default mongoose.model<Examples>('Examples', examplesSchema);