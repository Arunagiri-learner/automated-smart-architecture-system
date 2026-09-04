import { Request, Response } from 'express';
import { UserStore, UserModel } from '../models/User';
import { generateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { checkDbConnection, isProductionOrMongoConfigured } from '../config/db';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enforce MongoDB in production or when MONGODB_URI is provided
    if (isProductionOrMongoConfigured()) {
      if (!checkDbConnection()) {
        return res.status(503).json({
          success: false,
          error: 'Database connection unavailable. Production environment requires an active MongoDB database connection.',
        });
      }

      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const doc = await UserModel.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: role || 'Architect',
        isDemo: false,
      });

      const safeUser = {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        isDemo: false,
        createdAt: doc.createdAt.toISOString(),
      };

      const token = generateToken(safeUser);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: safeUser,
      });
    } else {
      // Offline Local Dev In-Memory UserStore
      const user = await UserStore.create({
        name,
        email: cleanEmail,
        password,
        role,
      });

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user,
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your email and password',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enforce MongoDB in production or when MONGODB_URI is provided
    if (isProductionOrMongoConfigured()) {
      if (!checkDbConnection()) {
        return res.status(503).json({
          success: false,
          error: 'Database connection unavailable. Production environment requires an active MongoDB database connection.',
        });
      }

      const doc = await UserModel.findOne({ email: cleanEmail });
      if (!doc) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const isMatch = await doc.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const safeUser = {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        isDemo: doc.isDemo,
        createdAt: doc.createdAt.toISOString(),
      };

      const token = generateToken(safeUser);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: safeUser,
      });
    } else {
      // Offline Local Dev In-Memory UserStore
      const user = await UserStore.findByEmail(cleanEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const isMatch = await UserStore.verifyPassword(user, password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const { passwordHash: _, ...safeUser } = user;
      const token = generateToken(safeUser);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: safeUser,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Login failed due to server error',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }

  return res.json({
    success: true,
    user: req.user,
  });
};

export const logout = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
