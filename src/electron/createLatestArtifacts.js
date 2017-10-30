/*
 * Copyright 2017 dialog LLC <info@dlg.im>
 * @flow
 */

import type { DesktopPublishOptions } from '../types';
import type { BuildResult } from './build';
const path = require('path');
const Promise = require('bluebird');
const S3 = require('aws-sdk/clients/s3');

async function createLatestArtifact(result: BuildResult, version: string, options: DesktopPublishOptions) {
  const s3 = Promise.promisifyAll(new S3({
    signatureVersion: 'v4',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }));

  for (const item of result) {
    for (const fileName of item.paths) {
      const baseName = path.basename(fileName);

      await s3.copyObjectAsync({
        Bucket: options.bucket,
        CopySource: `${options.bucket}/${baseName}`,
        Key: baseName.replace(version, 'latest'),
        ACL: 'public-read'
      });
    }
  }
}

module.exports = createLatestArtifact;