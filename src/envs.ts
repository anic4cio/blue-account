interface IEnvs {
  username: string
  password: string
  slackToken: string
  cloudFunctionToken: string
}

const envs: IEnvs = {
  username: process.env.BLUE_USER!,
  password: process.env.BLUE_PASS!,
  slackToken: process.env.SLACK_TOKEN!,
  cloudFunctionToken: process.env.CLOUD_FUNCTION_TOKEN!
}

export default envs
