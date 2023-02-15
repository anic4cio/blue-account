import envs from './envs'
import { Request } from 'firebase-functions'

type tokenType = string | string[] | undefined

interface IAuthResponse {
  status: number
  success: boolean
  message: string
}

export default (req: Request) => {
  const response: IAuthResponse = {
    status: 200,
    success: true,
    message: 'success'
  }

  const authenticate = () => {
    const tokenReceived = req.headers?.['x-access-token']
    if (tokenReceived) {
      const ownToken = getOwnToken()
      return compareReceivedToken(tokenReceived, ownToken)
    } else {
      response['status'] = 401
      response['success'] = false
      response['message'] = 'No token provided'
    }
  }

  const getOwnToken = () => {
    if (envs.cloudFunctionToken) return envs.cloudFunctionToken
    throw new Error('Application without own token')
  }

  const compareReceivedToken = (tokenReceived: tokenType, ownToken: string) => {
    if (typeof tokenReceived !== 'string' || tokenReceived !== ownToken) {
      response['status'] = 403
      response['success'] = false
      response['message'] = 'Failed to authenticate token'
    } else return
  }

  authenticate()
  return response
}
