#!/usr/bin/env node
'use strict';
if (Number(process.versions.node.split('.')[0]) < 22) {
  console.error('This launcher needs Node.js 22 or newer. See SETUP.md. You can read the labs without it.');
  process.exitCode = 1;
} else {
  require('./.course/launcher.cjs').main().catch(error => {
    console.error('\nCould not continue: ' + error.message);
    process.exitCode = 1;
  });
}
