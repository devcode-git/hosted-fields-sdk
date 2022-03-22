#### 1.2.4
- Updated dependencies and patched vulnerabilities

#### 1.2.3
- Security update: PostMessage origin checks
- Support auto-focus on next field when value is valid

#### 1.2.2
- Upgrade in package.json and security vulnerabilities in dependencies

#### 1.2.1
- Bug fix: Add an try catch around certain operations that are trying to 'appendChild' or get 'contentWindow'. It failed in some occasions and caused
the onLoadCallback never to be triggered.

#### 1.2.0
- Allow all fields to be returned in a single iframe - renderMode: 'single' || 'multiple' (defaults to multiple)
- Reported errors. All fields that reported an error are now returned in the array of errors (Thank you @vannhu-nguyen for the fix)

#### 1.1.1
- The Field constructor was missing support for noAttributeValueFormatting and autocomplete
  Now supports both, noAttributeValueFormatting defaults to false, autocomplete to empty string.

#### 1.1.0
- Removed jquery as dependency (not used enough to warrant its inclusion)
- Added fields onload callback
- Updated dependencies
- Bugfix to build step - caused package to be a lot bigger than it had to be

#### 1.0.15
- Upgraded depedencies that reported security alerts (js-yaml, jquery)

#### 1.0.14
- Allow focus to be set to iframes (need to allow tabbing into inputs for example)

#### 1.0.13
- Upgraded browserify due to a security alert of a sub-dependecy

#### 1.0.9
- Tabindex -1 on the iframe-elements so that focus is set to input field right away instead of the iframe-element.

#### 1.0.8
- Reset shouldn't be an action, it should only be a method that the parent-application can call

#### 1.0.7
- Added reset() as a method to HostedFields. Resets the targets to an empty array. Necessary to run before running a new setupContent to avoid duplicates.

#### 1.0.6
- Updated readme

#### 1.0.5
- Reverted back so callback of formData is callback()(formData)

#### 1.0.4
- Forgot the build the previous version (no update to dist)

#### 1.0.3
- Bugfix: form callback didn't send formData

#### 1.0.2
- Updated readme

#### 1.0.1
- Using 2.6.0 of uglify-js since earlier versions had a security-gap
- Docs showing test-environment for hosted-fields.

#### 1.0.0
- initial commit, basic features for generating fields.
