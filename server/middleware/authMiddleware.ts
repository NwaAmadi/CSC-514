import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
  }
}


export const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string }
    req.user = decoded
    next()
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' })
  }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string }
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden. Not an admin.' })
    }
    req.user = decoded
    next()
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' })
  }
}