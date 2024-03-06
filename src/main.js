const path = require('path')
const { program } = require('commander'); // 配置和解析用户输入的命令

const { version, downLoadDirectory } = require('./constants');

const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: ['scl create <project-name>'],
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: ['scl config set <k> <v>', 'scl config get <k>'],
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: [],
  },
};

Reflect.ownKeys(mapActions).forEach((action) => {
  program
    .command(action) // 配置命令的名字
    .alias(mapActions[action].alias) // 配置命令的别名
    .description(mapActions[action].description) // 命令对应描述
    .action(() => {
      if (action === '*') {
        console.log(mapActions[action].description);
      } else {
        const fn = require(path.resolve(__dirname, action)) // 动态获取执行各个命令模块的文件
        // process.argv获取用户输入的命令
        fn(...process.argv.slice(3))
      }
    });
});

program.on('--help', () => { // 监听用户输入的--help
  console.log('\nExamples:');
  Reflect.ownKeys(mapActions).forEach((action) => {
    mapActions[action].examples.forEach((example) => {
      console.log(`  ${example}`); // 输出帮助命令
    })
  })
})

// 解析用户传过来的参数,并在命令行面板输入0.1.0（默认：scl --version）
program.version(version).parse(process.argv);
