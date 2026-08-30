import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {

        throw new ApiError(409, "Email already registered");

  }
  
          const hashedPassword = await bcrypt.hash(password, 10); 

          const user = await User.create ({
            name,
            email,
            password: hashedPassword
          });

          res.status(201).json({
            message: "User registered successfully",

            data: {
                name: user.name,
                email: user.email,
                _id: user._id,
            }
          });
   
});

const loginUser = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(!user) {
          throw new ApiError(401, "Inavalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new ApiError(401, "Invalid email or password");
        }

        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,

  });
})

const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) {
        throw new ApiError(400, "Google credential is required");
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });

    if (user) {
        // Safe account linking
        if (user.authProvider !== 'google') {
            user.googleId = googleId;
            user.authProvider = 'google';
            await user.save();
        }
    } else {
        // Create new Google user
        user = await User.create({
            name,
            email,
            googleId,
            authProvider: 'google',
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.status(200).json({
        message: "Google Login successful",
        token,
    });
});

export {
    registerUser,
    loginUser,
    googleAuth
};