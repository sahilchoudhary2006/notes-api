import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

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

export {
    registerUser,
    loginUser
};