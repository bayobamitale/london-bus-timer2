const { withProjectBuildGradle } = require('expo/config-plugins');

// Expo SDK 57 pins the Kotlin Gradle plugin to the version React Native's Gradle
// plugin depends on (2.1.20), and `expo-build-properties`' `android.kotlinVersion`
// does not override it. play-services-ads 25.x ships Kotlin 2.3 metadata, which a
// 2.1 compiler refuses to read, so the Kotlin plugin has to be forced here.
//
// The chosen version must be one that `io.github.lukmccall.pika:pika-compiler`
// publishes an artifact for, since `:expo` resolves it as `<pika>-<kotlinVersion>`.
const CLASSPATH_ANCHOR = "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')";
const MARKER = '// expo-kotlin-version-override';

function applyKotlinVersion(contents, version) {
  if (contents.includes(MARKER)) {
    return contents;
  }

  if (!contents.includes(CLASSPATH_ANCHOR)) {
    throw new Error(
      `withKotlinVersion: could not find "${CLASSPATH_ANCHOR}" in android/build.gradle. ` +
        'The Expo Android template changed — update this plugin.'
    );
  }

  const resolutionStrategy = `  ${MARKER}
  configurations.classpath {
    resolutionStrategy.eachDependency { details ->
      if (details.requested.group == 'org.jetbrains.kotlin') {
        details.useVersion('${version}')
      }
    }
  }
`;

  return contents
    .replace(CLASSPATH_ANCHOR, `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:${version}')`)
    .replace(/^(buildscript \{\n)/m, `$1${resolutionStrategy}`);
}

module.exports = function withKotlinVersion(config, { version } = {}) {
  if (!version) {
    throw new Error('withKotlinVersion: a "version" option is required.');
  }

  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('withKotlinVersion: only Groovy build.gradle is supported.');
    }

    cfg.modResults.contents = applyKotlinVersion(cfg.modResults.contents, version);
    return cfg;
  });
};
