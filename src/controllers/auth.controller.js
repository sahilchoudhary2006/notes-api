import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";

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

export {
    registerUser
};