import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {Users} from '../interfaces/users';

const usersSchema: mongoose.Schema = new mongoose.Schema<Users>({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true, minlength: 6, maxlength: 20},
    name: {type: String, required: true, trim: true, minlength: 2, maxlength: 50},
    image: String,
    active: {type: Boolean, default: true},
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpires: Date,
    passwordResetCodeVerify: Boolean
}, {timestamps: true});

const imageUrl = (document: Users): void => {
    if (document.image) {
        document.image = `${process.env.BASE_URL}/users/${document.image}`;
    }
};

usersSchema.post('init', (document: Users): void => {
    imageUrl(document);
}).post('save', (document: Users): void => {
    imageUrl(document);
});

usersSchema.pre<Users>('save', async function (next: mongoose.CallbackWithoutResultAndOptionalError): Promise<void> {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 13);
    next();
});

// usersSchema.pre<Examples>(/^find/, function (next) {
//     this.populate({ path: 'category', select: 'name_en name_ar' });
//     next();
// });

export default mongoose.model<Users>('users', usersSchema);