import envs from './envs'
import { Request, Response } from 'firebase-functions'

type tokenType = string | string[] | undefined

export default (req: Request, res: Response) => {
  const authenticate = () => {
    const tokenReceived = req.headers?.['x-access-token']
    if (tokenReceived) {
      const ownToken = getOwnToken()
      return compareReceivedToken(tokenReceived, ownToken)
    } else {
      return res.status(401).json({
        success: false,
        message: 'No token provided.',
      })
    }
  }

  const getOwnToken = () => {
    if (envs.cloudFunctionToken) return envs.cloudFunctionToken
    throw new Error('Application without own token')
  }

  const compareReceivedToken = (tokenReceived: tokenType, ownToken: string) => {
    if (typeof tokenReceived !== 'string' || tokenReceived !== ownToken) {
      return res.status(403).json({
        success: false,
        message: 'Failed to authenticate token.',
      })
    } else return
  }

  authenticate()
}
