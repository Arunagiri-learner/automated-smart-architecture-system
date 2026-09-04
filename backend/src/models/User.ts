import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isDemo: boolean;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['Architect', 'Construction Manager', 'Facility Manager'],
      default: 'Architect',
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

// ============================================================================
// IN-MEMORY USER STORE (FALLBACK FOR WHEN MONGODB ATLAS IS NOT CONNECTED)
// ============================================================================
class UserStoreService {
  private users: Map<string, IUser & { passwordHash: string }> = new Map();

  constructor() {
    // Seed default demo user in store if needed
    const defaultSalt = bcrypt.genSaltSync(10);
    const defaultHash = bcrypt.hashSync('demo123', defaultSalt);
    this.users.set('demo-user-01', {
      id: 'demo-user-01',
      name: 'Arch. Alex Morgan',
      email: 'alex.morgan@asas-studio.com',
      role: 'Architect',
      passwordHash: defaultHash,
      isDemo: true,
      createdAt: new Date().toISOString(),
    });
  }

  public async findByEmail(email: string): Promise<(IUser & { passwordHash: string }) | undefined> {
    const cleanEmail = email.trim().toLowerCase();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  }

  public async findById(id: string): Promise<IUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public async create(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUser> {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await this.findByEmail(cleanEmail);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const id = `usr-${Date.now()}`;

    const newUser = {
      id,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role || 'Architect',
      passwordHash,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    this.users.set(id, newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  public async verifyPassword(user: IUser & { passwordHash: string }, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}

export const UserStore = new UserStoreService();
