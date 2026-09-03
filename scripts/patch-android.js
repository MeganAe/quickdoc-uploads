import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const appBuildGradle = path.join(androidDir, "app", "build.gradle");
const gradleProperties = path.join(androidDir, "gradle.properties");

if (fs.existsSync(appBuildGradle)) {
  let content = fs.readFileSync(appBuildGradle, "utf-8");

  const resolutionPatch = `
// Resolve Kotlin duplicate classes (kotlin-stdlib-jdk7/8 vs kotlin-stdlib)
configurations.all {
    resolutionStrategy {
        force "org.jetbrains.kotlin:kotlin-stdlib:1.8.22"
        force "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22"
        force "org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22"
    }
}

dependencies {
    constraints {
        implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22") {
            because("kotlin-stdlib-jdk7 is now part of kotlin-stdlib")
        }
        implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22") {
            because("kotlin-stdlib-jdk8 is now part of kotlin-stdlib")
        }
    }
}
`;

  if (!content.includes("org.jetbrains.kotlin:kotlin-stdlib-jdk7")) {
    content += "\n" + resolutionPatch;
    fs.writeFileSync(appBuildGradle, content, "utf-8");
    console.log("✓ Patched android/app/build.gradle with Kotlin resolution constraints");
  }
}

if (fs.existsSync(gradleProperties)) {
  let props = fs.readFileSync(gradleProperties, "utf-8");
  if (!props.includes("android.enableJetifier")) {
    props += "\nandroid.enableJetifier=true\n";
    fs.writeFileSync(gradleProperties, props, "utf-8");
    console.log("✓ Added android.enableJetifier=true to android/gradle.properties");
  }
}
