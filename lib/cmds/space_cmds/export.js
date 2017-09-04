import {getContext} from '../../context'
import * as log from '../../utils/log'
import runContentfulExport from 'contentful-export'
import {handleAsyncError as handle} from '../../utils/async'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { proxyObjectToString } from '../../utils/proxy'
import emojic from 'emojic'
import { version } from '../../../package.json'

export const command = 'export'

export const desc = 'export a space data to a json file'

export const builder = function (yargs) {
  return yargs
    .option('space-id', {
      describe: 'space to export',
      type: 'string'
    })
    .option('export-dir', {
      describe: 'Defines the path for storing the export json file (default path is the current directory)',
      type: 'string'
    })
    .option('include-drafts', {
      describe: 'Include drafts in the exported entries',
      type: 'boolean',
      default: false
    })
    .option('skip-content-model', {
      describe: 'Skip exporting content models',
      type: 'boolean',
      default: false
    })
    .option('skip-content', {
      describe: 'Skip exporting assets and entries',
      type: 'boolean',
      default: false
    })
    .option('skip-roles', {
      describe: 'Skip exporting roles and permissions',
      type: 'boolean',
      default: false
    })
    .option('skip-webhooks', {
      describe: 'Skip exporting webhooks',
      type: 'boolean',
      default: false
    })
    .option('download-assets', {
      describe: 'With this flags assets will also be downloaded',
      type: 'boolean'
    })
    .option('max-allowed-limit', {
      describe: 'How many items per page per request',
      type: 'number',
      default: 1000
    })
    .option('management-host', {
      describe: 'Management API host',
      type: 'string',
      default: 'api.contentful.com'
    })
    .option('error-log-file', {
      describe: 'Full path to the error log file',
      type: 'string'
    })
    .option('save-file', {
      describe: 'Save the export as a json file',
      type: 'boolean',
      default: true
    })
    .config('config', 'An optional configuration JSON file containing all the options for a single run')
    .epilog('Copyright 2017 Contentful, this is a BETA release')
}

export const exportSpace = async (argv) => {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId, proxy } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId
  const managementToken = cmaToken
  const managementHeaders = {'X-Contentful-Beta-Content-Type-Migration': 'true'}
  const managementApplication = `contentful.cli/${version}`

  const options = { ...argv, spaceId, managementApplication, managementHeaders, managementToken }

  if (proxy) {
    // contentful-import and contentful-export
    // expect a string for the proxy config
    // and create agents from it
    options.proxy = proxyObjectToString(proxy)
  }
  try {
    const exportResult = await runContentfulExport(options)
    log.success(`${emojic.sparkles} Done`)
    return exportResult
  } catch (err) {
    throw err
  }
}
export const handler = handle(exportSpace)