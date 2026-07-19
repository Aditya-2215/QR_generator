import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DatabaseService } from "../services/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "qrverse-super-secret-key-3591823091";
const TOKEN_EXPIRY = "7d";

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }

      const existingUser = await DatabaseService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await DatabaseService.createUser(name, email, passwordHash);

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      console.error("Register error:", err);
      return res.status(500).json({ error: "Server error during registration." });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = await DatabaseService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error during login." });
    }
  },

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await DatabaseService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      console.error("GetMe error:", err);
      return res.status(500).json({ error: "Server error fetching user details." });
    }
  },
};
