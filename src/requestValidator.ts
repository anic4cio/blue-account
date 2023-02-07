import { Request } from 'firebase-functions'

export default (req: Request) => {
  if (req.method !== 'POST') {
    return {
      code: 405,
      message: 'Only POST method accepted',
      success: false,
    }
  }
  if (!req.body || typeof req.body !== 'object') {
    return {
      code: 400,
      message: 'Must send body',
      success: false,
    }
  }
  return { code: 200, message: 'sucess', success: true }
}
