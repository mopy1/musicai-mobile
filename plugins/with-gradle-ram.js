// Config plugin CNG: aplica límites de RAM para Gradle en cada `expo prebuild`
// optimizado para entorno WSL con 8 GB de RAM.
const { withGradleProperties } = require('expo/config-plugins');

const PROPIEDADES = {
  'org.gradle.workers.max': '2',
  'org.gradle.jvmargs': '-Xmx2560m -XX:MaxMetaspaceSize=640m -Dfile.encoding=UTF-8',
  'org.gradle.parallel': 'false',
  'org.gradle.daemon': 'false',
  'kotlin.compiler.execution.strategy': 'in-process',
  reactNativeArchitectures: 'arm64-v8a',
  'android.enableMinifyInReleaseBuilds': 'false',
  'android.enablePngCrunchInReleaseBuilds': 'false',
};

module.exports = function withGradleRam(config) {
  return withGradleProperties(config, (cfg) => {
    for (const [key, value] of Object.entries(PROPIEDADES)) {
      cfg.modResults = cfg.modResults.filter((p) => !(p.type === 'property' && p.key === key));
      cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
};
