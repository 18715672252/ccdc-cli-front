const axios = require('axios')

const ora = require('ora')
// create命令模块
const inquirer = require('inquirer')

const handlebars = require('handlebars')

const chalk = require('chalk')

const logSymbols = require('log-symbols')

// eslint-disable-next-line import/no-extraneous-dependencies
let ncp = require('ncp')

const path = require('path')

const fs = require('fs')

let downloadGitRepo = require('download-git-repo')

const { promisify } = require('util')

downloadGitRepo = promisify(downloadGitRepo)
ncp = promisify(ncp)

const { downLoadDirectory } = require('./constants');

const fetchRepoList = async () => {
  const { data } = await axios.get('https://api.github.com/orgs/18715672252/repos')
  return data
}

const templateList = [
  {
    url: 'direct:https://github.com/18715672252/vue-ccd#main',
    name: 'vue-template',
  },
  // {
  //   url: 'direct:https://github.com/18715672252/vue-template#main',
  //   name: 'react-template',
  // },
]

const downLoad = async (name, projectName) => {
  const [{ url }] = templateList.filter(item => item.name === name)
  const downUrl = `${downLoadDirectory}/repo`
  try {
    await downloadGitRepo(url, projectName, { clone: true })
    return downUrl
  } catch (error) {
    return Promise.reject(error)
  }
}

// const waitFnLoading = async () => {
//   const spinner = ora()
//   spinner.start()
//   await new Promise((re) => {
//     setTimeout(() => {
//       re()
//     }, 300000)
//   })
//   spinner.succeed()
//   return 100
// }

// 拉去所有的项目让用户选择安装那个项目2
// 选完后显示版本号
// 还需要用户输入一些数据，来结合渲染我的项目
// https://github.com/orgs/18715672252/repos 获取用户的项目
module.exports = async (projectName) => {
//   let repos = fetchRepoList()
//   repos = repos.map((item) => item.name)
//   console.log(repos)

  // await waitFnLoading()
  // 用户选择后的名字（'韩立', '厉飞雨'）其中之一
  const { repo } = await inquirer.prompt([
    {
      name: 'repo',
      type: 'list',
      message: '请选选择模板',
      choices: templateList.map(item => item.name),
    },
  ])
  const userInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称',
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目描述',
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入作者',
    },
  ])
  console.log(repo) // 用户选择的templateList中的某一项的name
  const spinner = ora('fetching template...')
  spinner.start()
  try {
    await downLoad(repo, projectName)
    const packageContent = fs.readFileSync(`${projectName}/package.json`, 'utf8')
    const packageResult = handlebars.compile(packageContent)(userInfo)
    fs.writeFileSync(`${projectName}/package.json`, packageResult)
    spinner.color = 'green'
    spinner.text = 'Template downloaded'
    spinner.succeed()
    console.log(logSymbols.success, chalk.green('Template init succeed'))
  } catch (error) {
    spinner.fail('下载模板失败：')
    console.log(logSymbols.error, chalk.green(error))
  }
  // path.resolve()当前路径
  // 复制文件
  // ncp(result, path.resolve(projectName))
}
