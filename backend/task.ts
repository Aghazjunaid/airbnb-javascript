import { Request, Response } from 'express';
import { Task, TaskInput } from '../models/task.model';

interface CustomRequest extends Request {
  token: {
    _id: string;
  };
}

export const createTask = async (req: Request, res: Response) => {
  const { description, title, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(422).json({
      message: 'The fields title and dueDate are required',
    });
  }

  const dueDateObj = new Date(dueDate);
  const now = new Date();

  if (dueDateObj < now) {
    return res.status(422).json({
      message: 'The dueDate cannot be in the past',
    });
  }

  const roleInput: TaskInput = {
    title,
    description,
    dueDate,
    completed: false,
    user: (req as CustomRequest).token._id,
  };

  try {
    const roleCreated = await Task.create(roleInput);

    return res.status(201).json({ data: roleCreated });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({
      user: (req as CustomRequest).token._id,
    })
      .sort('-createdAt')
      .exec();

    return res.status(200).json({ data: tasks });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({ _id: id, user: (req as CustomRequest).token._id });

    if (!task) {
      return res.status(404).json({ message: `Task with id "${id}" not found.` });
    }

    return res.status(200).json({ data: task });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, title, dueDate, completed } = req.body;

  // if (dueDate) {
  //   const dueDateObj = new Date(dueDate);
  //   const now = new Date();

  //   if (dueDateObj < now) {
  //     return res.status(422).json({
  //       message: 'The dueDate cannot be in the past',
  //     });
  //   }
  // }

  try {
    const task = await Task.findOne({ _id: id, user: (req as CustomRequest).token._id });

    if (!task) {
      return res.status(404).json({ message: `Task with id "${id}" not found.` });
    }

    await Task.updateOne({ _id: id, user: (req as CustomRequest).token._id }, { title, description, dueDate, completed });

    const taskUpdated = await Task.findById(id);

    return res.status(200).json({ data: taskUpdated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete({ _id: id, user: (req as CustomRequest).token._id });

    if (!deletedTask) {
      return res.status(404).json({ message: `Task with id "${id}" not found.` });
    }

    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const expireTasks = async () => {
  try {
    const now = new Date();
    console.log(now);

    await Task.updateMany(
      {
        dueDate: { $lt: now },
      },
      { completed: true },
    );
  } catch (error) {
    //push error to sentry or kafka topic to track
    console.log(error);
  }
};


import { Request, Response } from 'express';
import { hashSync, compare, genSaltSync } from 'bcryptjs';
import { User, UserInput } from '../models/user.model';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

export const SECRET_KEY: Secret = 'your-secret-key-here';

export const Signup = async (req: Request, res: Response) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !fullName || !password) {
      return res.status(400).json({ message: 'The fields email, fullName, password are required' });
    }

    const salt = genSaltSync(10);
    const userInput: UserInput = {
      fullName,
      email,
      password: hashSync(password, salt),
    };

    const userCreated = await User.create(userInput);

    return res.status(200).json({ data: userCreated });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'The fields email, password are required' });
    }

    const user = await User.findOne({ email: email }).exec();
    if (user) {
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'invalid login details' });
      }

      const token = jwt.sign({ _id: user._id?.toString(), email: user.email }, SECRET_KEY, {
        expiresIn: '2 days',
      });
      return res.status(200).json({ data: user, token });
    }

    return res.status(400).json({ message: 'invalid email and password' });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

import mongoose, { Schema, Model, Document } from 'mongoose';

type TaskDocument = Document & {
  title: string;
  description: string | null;
  dueDate: Date;
  completed: boolean;
  user: string;
};

type TaskInput = {
  title: TaskDocument['title'];
  description: TaskDocument['description'];
  dueDate: TaskDocument['dueDate'];
  completed: TaskDocument['completed'];
  user: TaskDocument['user'];
};

const taskSchema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      default: null,
    },
    dueDate: {
      type: Schema.Types.Date,
      required: true,
    },
    completed: {
      type: Schema.Types.String,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId, 
      ref:"users"
    },
  },
  {
    collection: 'tasks',
    timestamps: true,
  },
);

const Task: Model<TaskDocument> = mongoose.model<TaskDocument>('Task', taskSchema);

export { Task, TaskInput, TaskDocument };

import mongoose, { Schema, Model, Document } from 'mongoose';

type UserDocument = Document & {
  fullName: string;
  email: string;
  password: string;
};

type UserInput = {
  fullName: UserDocument['fullName'];
  email: UserDocument['email'];
  password: UserDocument['password'];
};

const usersSchema = new Schema(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  },
);

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', usersSchema);

export { User, UserInput, UserDocument };

import { Router } from 'express';
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from '../controllers/task.controller';
import {authMiddleware} from '../utils/auth';

export const roleRoutes = () => {
  const router = Router();

  router.post('/task', authMiddleware, createTask);

  router.get('/tasks', authMiddleware, getAllTasks);

  router.get('/task/:id', authMiddleware, getTaskById);

  router.patch('/task/:id', authMiddleware, updateTask);

  router.delete('/task/:id', authMiddleware, deleteTask);

  return router;
};

import { Router } from 'express';
import { Signup, Login} from '../controllers/user.controller';

export const userRoutes = () => {
  const router = Router();

  router.post('/signup', Signup);

  router.post('/login', Login);

  return router;
};

import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const SECRET_KEY: Secret = 'your-secret-key-here';

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

import cron from 'node-cron';
import { expireTasks } from '../controllers/task.controller';

export const job = cron.schedule('* * * * *', expireTasks);

import mongoose, { ConnectOptions } from 'mongoose';

mongoose.Promise = global.Promise;

const MONGODB_URL  = 'mongodb://127.0.0.1/crud';

const connectToDatabase = async (): Promise<void> => {
  if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is not defined');
  }

  const options: ConnectOptions = { autoIndex: true };

  await mongoose.connect(MONGODB_URL, options);
};

export { connectToDatabase };

import express from 'express';
import { connectToDatabase } from './db-connection';
import { roleRoutes } from './routes/task.route';
import { userRoutes } from './routes/user.route';
import { job } from './utils/job';

const HOST = process.env.HOST || 'http://localhost';
const PORT = parseInt(process.env.PORT || '4500');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', roleRoutes());
app.use('/', userRoutes());

job.start();

app.get('/', (req, res) => {
  return res.json({ message: 'Hello World!' });
});

app.listen(PORT, async () => {
  await connectToDatabase();

  console.log(`Application started on URL ${HOST}:${PORT} 🎉`);
});

{
  "name": "node-typescript-starter",
  "version": "1.0.0",
  "description": "Node project starter with TypeScript, ESLint and Prettier",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "serve": "node dist/index.js"
  },
  "dependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.7",
    "bcrypt-ts": "^5.0.2",
    "bcryptjs": "^2.4.3",
    "express": "4.21.0",
    "i": "^0.3.7",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "8.7.0",
    "node-cron": "^3.0.3",
    "npm": "^10.9.0"
  },
  "devDependencies": {
    "@types/express": "4.17.21",
    "@types/node": "22.7.4",
    "@types/node-cron": "^3.0.11",
    "@typescript-eslint/eslint-plugin": "8.8.0",
    "@typescript-eslint/parser": "8.8.0",
    "eslint": "8.57.1",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-prettier": "5.2.1",
    "eslint-plugin-sort-destructure-keys": "2.0.0",
    "husky": "9.1.6",
    "lint-staged": "15.2.10",
    "prettier": "3.3.3",
    "ts-node": "10.9.2",
    "typescript": "5.6.2"
  },
  "lint-staged": {
    "**/*.ts?(x)": [
      "eslint src --fix",
      "prettier --write"
    ]
  },
  "packageManager": "yarn@1.22.22"
}

{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["dom"],
    "outDir": "./build",
    "strict": true,
    "baseUrl": "./",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports":true,
    "skipLibCheck": true
  },
  "include": [
    "./src/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
