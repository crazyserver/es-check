#!/usr/bin/env node

'use strict'

const { program, Option } = require('commander')
const acorn = require('acorn')
const glob = require('fast-glob')
const fs = require('fs')
const detectFeatures = require('./detectFeatures')
let polyfillDetector = null;
const pkg = require('./package.json')
const { lilconfig } = require('lilconfig');
const { JS_VERSIONS } = require('./constants');
const { parseIgnoreList, createLogger, generateBashCompletion, generateZshCompletion } = require('./utils');

program.configureOutput({
  writeOut: (str) => process.stdout.write(str),
  writeErr: (str) => process.stderr.write(str),
  outputError: (str, write) => write(str)
});

program.showHelpAfterError();
program.enablePositionalOptions();
program.showSuggestionAfterError();

/**
 * es-check 🏆
 * ----
 * @description
 * - define the EcmaScript version to check for against a glob of JavaScript files
 * - match the EcmaScript version option against a glob of files
 *   to to test the EcmaScript version of each file
 * - error failures
 */
program
  .command('completion')
  .description('generate shell completion script')
  .argument('[shell]', 'shell type: bash, zsh', 'bash')
  .action((shell) => {
    const logger = createLogger();

    let completionScript;

    const commands = ['completion'];
    const options = [];

    program.options.forEach(opt => {
      const flag = opt.long || opt.short;
      if (flag) {
        options.push(flag.replace(/^-+/, ''));
      }
    });

    switch (shell) {
      case 'bash':
        completionScript = generateBashCompletion('es-check', commands, options);
        break;
      case 'zsh':
        completionScript = generateZshCompletion('es-check', commands, options);
        break;
      default:
        logger.error(`Shell "${shell}" not supported for completion. Supported shells: bash, zsh`);
        process.exit(1);
    }

    logger.info(completionScript);
  });

program
  .version(pkg.version)
  .argument(
    '[ecmaVersion]',
    'ecmaVersion to check files against. Can be: es3, es4, es5, es6/es2015, es7/es2016, es8/es2017, es9/es2018, es10/es2019, es11/es2020, es12/es2021, es13/es2022, es14/es2023, checkBrowser',
  )
  .argument('[files...]', 'a glob of files to to test the EcmaScript version against')
  .option('--module', 'use ES modules')
  .addOption(new Option('--allow-hash-bang', 'if the code starts with #! treat it as a comment').default(false).hideHelp())
  .option('--allowHashBang', 'if the code starts with #! treat it as a comment', false)
  .option('--files <files>', 'a glob of files to to test the EcmaScript version against (alias for [files...])')
  .option('--not <files>', 'folder or file names to skip')
  .addOption(new Option('--no-color', 'disable use of colors in output').default(false).hideHelp())
  .option('--noColor', 'disable use of colors in output', false)
  .option('-v, --verbose', 'verbose mode: will also output debug messages', false)
  .option('--quiet', 'quiet mode: only displays warn and error messages', false)
  .option('--looseGlobMatching', 'doesn\'t fail if no files are found in some globs/files', false)
  .option('--checkFeatures', 'check features of es version', false)
  .option('--checkForPolyfills', 'consider polyfills when checking features (only works with --checkFeatures)', false)
  .option(
    '--silent',
    'silent mode: does not output anything, giving no indication of success or failure other than the exit code', false
  )
  .option('--ignore <features>', 'comma-separated list of features to ignore, e.g., "ErrorCause,TopLevelAwait"')
  .addOption(new Option('--ignore-file <path>', 'path to JSON file containing features to ignore').hideHelp())
  .option('--ignoreFile <path>', 'path to JSON file containing features to ignore')
  .option('--allowList <features>', 'comma-separated list of features to allow even in lower ES versions, e.g., "const,let"')
  .addOption(new Option('--checkBrowser', 'use browserslist configuration to determine ES version, use checkBrowser argument instead of ecmaVersion', false).hideHelp())
  .option('--browserslistQuery <query>', 'browserslist query')
  .option('--browserslistPath <path>', 'path to custom browserslist configuration')
  .option('--browserslistEnv <env>', 'browserslist environment to use')
  .option('--config <path>', 'path to custom .escheckrc config file')

async function loadConfig(customConfigPath) {
  const logger = createLogger();

  try {
    if (customConfigPath) {
      try {
        const content = fs.readFileSync(customConfigPath, 'utf8');
        const config = JSON.parse(content);
        return Array.isArray(config) ? config : [config];
      } catch (err) {
        throw new Error(`Error loading custom config file ${customConfigPath}: ${err.message}`);
      }
    }

    const configExplorer = lilconfig('escheck', {
      searchPlaces: ['.escheckrc', '.escheckrc.json', 'package.json'],
      loaders: {
        '.escheckrc': (filepath, content) => {
          try {
            return JSON.parse(content);
          } catch (err) {
            throw new Error(`Invalid JSON in ${filepath}`);
          }
        }
      }
    });

    const result = await configExplorer.search();
    if (!result) return [{}];

    const config = result.config;
    return Array.isArray(config) ? config : [config];
  } catch (err) {
    logger.error(`Error loading config: ${err.message}`);
    process.exit(1);
  }
}

program
  .action(async (ecmaVersionArg, filesArg, options) => {
    const logger = createLogger(options);

    if (filesArg && filesArg.length && options.files) {
      logger.error('Cannot pass in both [files...] argument and --files flag at the same time!')
      process.exit(1)
    }

    const validEcmaVersionValues = new Set(JS_VERSIONS);

    if (options.checkBrowser && ecmaVersionArg && !validEcmaVersionValues.has(ecmaVersionArg)) {
      filesArg.unshift(ecmaVersionArg);
      ecmaVersionArg = 'checkBrowser';
    }

    const configs = await loadConfig(options.config);
    const baseConfig = configs[0] || {};

    if (ecmaVersionArg || filesArg?.length || options.files) {
      const ignoreFilePath = options.ignoreFile || options['ignore-file'];

      if (ignoreFilePath && !fs.existsSync(ignoreFilePath) && logger.isLevelEnabled('warn')) {
        logger.warn(`Warning: Ignore file '${ignoreFilePath}' does not exist or is not accessible`);
      }

       const singleConfig = {
        ...baseConfig,
        module: options.module,
        allowHashBang: options.allowHashBang || options['allow-hash-bang'],
        checkFeatures: options.checkFeatures,
        checkForPolyfills: options.checkForPolyfills,
        ignore: options.ignore !== undefined ? options.ignore : baseConfig.ignore,
        ignoreFile: ignoreFilePath !== undefined ? ignoreFilePath : baseConfig.ignoreFile,
        not: options.not ? options.not.split(',').map(n => n.trim()).filter(Boolean) : baseConfig.not,
        looseGlobMatching: options.looseGlobMatching,
        allowList: options.allowList !== undefined ? options.allowList : baseConfig.allowList,
        checkBrowser: options.checkBrowser,
        browserslistQuery: options.browserslistQuery !== undefined ? options.browserslistQuery : baseConfig.browserslistQuery,
        browserslistPath: options.browserslistPath !== undefined ? options.browserslistPath : baseConfig.browserslistPath,
        browserslistEnv: options.browserslistEnv !== undefined ? options.browserslistEnv : baseConfig.browserslistEnv,
      };

      if (ecmaVersionArg !== undefined) {
        singleConfig.ecmaVersion = ecmaVersionArg;
      }
      // `filesArg` (positional) takes precedence. If not present, use `options.files` (flag). Else, stick with baseConfig.files.
      if (filesArg?.length) {
        singleConfig.files = filesArg;
      } else if (options.files) {
        singleConfig.files = options.files.split(',').map(f => f.trim()).filter(Boolean);
      }

      return runChecks([singleConfig], logger);
    }

    if (!configs.length) {
      logger.error('No configuration found. Please provide command line arguments or a config file.');
      process.exit(1);
    }

    return runChecks(configs, logger);
  })

async function runChecks(configs, logger) {
  let hasErrors = false;

  for (const config of configs) {
    const expectedEcmaVersion = config.ecmaVersion;
    let patternsToGlob = [];
    const configFilesValue = config.files;
    if (configFilesValue) {
      if (Array.isArray(configFilesValue)) {
        patternsToGlob = configFilesValue.map(p => String(p).trim()).filter(Boolean);
      } else if (typeof configFilesValue === 'string') {
        patternsToGlob = configFilesValue.split(',').map(p => p.trim()).filter(Boolean);
      }
    }

    const esmodule = config.module;
    const allowHashBang = config.allowHashBang;
    const pathsToIgnore = [].concat(config.not || []);
    const looseGlobMatching = config.looseGlobMatching;
    const checkFeatures = config.checkFeatures;
    const checkForPolyfills = config.checkForPolyfills;
    const checkBrowser = config.checkBrowser;
    const ignoreFilePath = config.ignoreFile || config['ignore-file'];

    if (ignoreFilePath && !fs.existsSync(ignoreFilePath) && logger.isLevelEnabled('warn')) {
      logger.warn(`Warning: Ignore file '${ignoreFilePath}' does not exist or is not accessible`);
    }

    if (!expectedEcmaVersion && !config.checkBrowser) {
      logger.error('No ecmaScript version or checkBrowser option specified in configuration');
      process.exit(1);
    }

    if (looseGlobMatching && logger.isLevelEnabled('debug')) {
      logger.debug('ES-Check: loose-glob-matching is set');
    }

    const globOpts = { nodir: true }
    let allMatchedFiles = [];
    if (patternsToGlob.length === 0 && !looseGlobMatching) {
        logger.error('ES-Check: No file patterns specified to check.');
        process.exit(1);
    }

    patternsToGlob.forEach((pattern) => {
      const globbedFiles = glob.sync(pattern, globOpts);
      if (globbedFiles.length === 0 && !looseGlobMatching) {
        logger.error(`ES-Check: Did not find any files to check for pattern: ${pattern}.`);
        process.exit(1);
      }
      allMatchedFiles = allMatchedFiles.concat(globbedFiles);
    });

    if (allMatchedFiles.length === 0) {
      if (patternsToGlob.length > 0) {
        logger.error(`ES-Check: Did not find any files to check across all patterns: ${patternsToGlob.join(', ')}.`);
        process.exit(1);
      } else if (looseGlobMatching) {
        logger.warn('ES-Check: No file patterns specified or no files found (running in loose mode).');
      }
    }

    let ecmaVersion

    const isBrowserslistCheck = Boolean(expectedEcmaVersion === 'checkBrowser' || checkBrowser !== undefined);
    if (isBrowserslistCheck) {
      const browserslistQuery = config.browserslistQuery;
      try {
        const { getESVersionFromBrowserslist } = require('./browserslist');
        const esVersionFromBrowserslist = getESVersionFromBrowserslist({
          browserslistQuery,
          browserslistPath: config.browserslistPath,
          browserslistEnv: config.browserslistEnv
        });

        ecmaVersion = esVersionFromBrowserslist.toString();

        if (logger.isLevelEnabled('debug')) {
          logger.debug(`ES-Check: Using ES${ecmaVersion} based on browserslist configuration`);
        }
      } catch (err) {
        logger.error(`Error determining ES version from browserslist: ${err.message}`);
        process.exit(1);
      }
    } else {
      switch (expectedEcmaVersion) {
      case 'es3':
        ecmaVersion = '3'
        break
      case 'es4':
        logger.error('ES4 is not supported.')
        process.exit(1)
      case 'es5':
        ecmaVersion = '5'
        break
      case 'es6':
      case 'es2015':
        ecmaVersion = '6'
        break
      case 'es7':
      case 'es2016':
        ecmaVersion = '7'
        break
      case 'es8':
      case 'es2017':
        ecmaVersion = '8'
        break
      case 'es9':
      case 'es2018':
        ecmaVersion = '9'
        break
      case 'es10':
      case 'es2019':
        ecmaVersion = '10'
        break
      case 'es11':
      case 'es2020':
        ecmaVersion = '11'
        break
      case 'es12':
      case 'es2021':
        ecmaVersion = '12'
        break
      case 'es13':
      case 'es2022':
        ecmaVersion = '13'
        break
      case 'es14':
      case 'es2023':
        ecmaVersion = '14'
        break
      default:
        logger.error('Invalid ecmaScript version, please pass a valid version, use --help for help')
        process.exit(1)
      }
    }

    const errArray = []
    const acornOpts = { ecmaVersion: parseInt(ecmaVersion, 10), silent: true }

    if (logger.isLevelEnabled('debug')) {
      logger.debug(`ES-Check: Going to check files using version ${ecmaVersion}`)
    }

    if (esmodule) {
      acornOpts.sourceType = 'module'
      if (logger.isLevelEnabled('debug')) {
        logger.debug('ES-Check: esmodule is set')
      }
    }

    if (allowHashBang) {
      acornOpts.allowHashBang = true
      if (logger.isLevelEnabled('debug')) {
        logger.debug('ES-Check: allowHashBang is set')
      }
    }

    const expandedPathsToIgnore = pathsToIgnore.reduce((result, path) =>
      path.includes('*') ? result.concat(glob.sync(path, globOpts)) : result.concat(path)
    , [])

    const filterForIgnore = (globbedFiles) => {
      if (expandedPathsToIgnore && expandedPathsToIgnore.length > 0) {
        return globbedFiles.filter(
          (filePath) => !expandedPathsToIgnore.some((ignoreValue) => filePath.includes(ignoreValue))
        );
      }
      return globbedFiles;
    }

    const filteredFiles = filterForIgnore(allMatchedFiles)

    const ignoreList = parseIgnoreList(config);

    if (ignoreList.size > 0 && logger.isLevelEnabled('debug')) {
      logger.debug('ES-Check: ignoring features:', Array.from(ignoreList).join(', '));
    }

    filteredFiles.forEach((file) => {
      const code = fs.readFileSync(file, 'utf8')
      if (logger.isLevelEnabled('debug')) {
        logger.debug(`ES-Check: checking ${file}`)
      }
      try {
        acorn.parse(code, acornOpts)
      } catch (err) {
        if (logger.isLevelEnabled('debug')) {
          logger.debug(`ES-Check: failed to parse file: ${file} \n - error: ${err}`)
        }
        const errorObj = {
          err,
          stack: err.stack,
          file,
        }
        errArray.push(errorObj);
        return;
      }

      if (!checkFeatures) return;
      const parseSourceType = acornOpts.sourceType || 'script';
      const esVersion = parseInt(ecmaVersion, 10);

      const { foundFeatures, unsupportedFeatures } = detectFeatures(
        code,
        esVersion,
        parseSourceType,
        ignoreList
      );

      if (logger.isLevelEnabled('debug')) {
        const stringifiedFeatures = JSON.stringify(foundFeatures, null, 2);
        logger.debug(`Features found in ${file}: ${stringifiedFeatures}`);
      }

      let filteredUnsupportedFeatures = unsupportedFeatures;
      if (checkForPolyfills && unsupportedFeatures.length > 0) {
        if (!polyfillDetector) {
          polyfillDetector = require('./polyfillDetector');
        }

        const polyfills = polyfillDetector.detectPolyfills(code, logger);

        filteredUnsupportedFeatures = polyfillDetector.filterPolyfilled(unsupportedFeatures, polyfills);

        if (logger.isLevelEnabled('debug') && filteredUnsupportedFeatures.length !== unsupportedFeatures.length) {
          logger.debug(`ES-Check: Polyfills reduced unsupported features from ${unsupportedFeatures.length} to ${filteredUnsupportedFeatures.length}`);
        }
      }

      const isSupported = filteredUnsupportedFeatures.length === 0;
      if (!isSupported) {
        const error = new Error(`Unsupported features used: ${filteredUnsupportedFeatures.join(', ')} but your target is ES${ecmaVersion}.`);
        errArray.push({
          err: error,
          file,
          stack: error.stack
        });
      }
    })

    if (errArray.length > 0) {
      logger.error(`ES-Check: there were ${errArray.length} ES version matching errors.`)
      errArray.forEach((o) => {
        logger.info(`
          ES-Check Error:
          ----
          · erroring file: ${o.file}
          · error: ${o.err}
          · see the printed err.stack below for context
          ----\n
          ${o.stack}
        `)
      })
      hasErrors = true;
      process.exit(1)
      return;
    }
    logger.info(`ES-Check: there were no ES version matching errors!  🎉`)
  }

  if (hasErrors) {
    process.exit(1);
  }
}

program.parse()
