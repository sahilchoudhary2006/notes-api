import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name : {
        type: String,
        required: true,

    },

    email : {
        type: String,
        required: true,
        unique: true,

    },

    password : {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        }
    },
    googleId: {
        type: String,
        default: null,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    }
});

const User = mongoose.model("User", userSchema);

export default User;