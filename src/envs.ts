interface IEnvs {
  username: string
  password: string
  loginUrl: string
  serviceUrl: string
}

const envs: IEnvs = {
  username: process.env.BLUE_USER!,
  password: process.env.BLUE_PASS!,
  loginUrl: process.env.URL_LOGIN!,
  serviceUrl: process.env.URL_SERVICE!
}

export default envs
