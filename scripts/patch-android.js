import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const appBuildGradle = path.join(androidDir, "app", "build.gradle");
const gradleProperties = path.join(androidDir, "gradle.properties");
const manifestXml = path.join(androidDir, "app", "src", "main", "AndroidManifest.xml");
const resDir = path.join(androidDir, "app", "src", "main", "res");
const iconPng = path.join(rootDir, "public", "icon.png");

// 1. Resolve Kotlin duplicate classes (kotlin-stdlib-jdk7/8 vs kotlin-stdlib)
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

// 2. Android Jetifier
if (fs.existsSync(gradleProperties)) {
  let props = fs.readFileSync(gradleProperties, "utf-8");
  if (!props.includes("android.enableJetifier")) {
    props += "\nandroid.enableJetifier=true\n";
    fs.writeFileSync(gradleProperties, props, "utf-8");
    console.log("✓ Added android.enableJetifier=true to android/gradle.properties");
  }
}

// 3. Android Permissions & Cleartext Traffic in AndroidManifest.xml
if (fs.existsSync(manifestXml)) {
  let manifest = fs.readFileSync(manifestXml, "utf-8");
  let modified = false;

  if (!manifest.includes("android.permission.INTERNET")) {
    manifest = manifest.replace(
      "<application",
      `<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n\n    <application`
    );
    modified = true;
  }

  if (!manifest.includes("android:usesCleartextTraffic")) {
    manifest = manifest.replace("<application", `<application android:usesCleartextTraffic="true"`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(manifestXml, manifest, "utf-8");
    console.log("✓ Updated AndroidManifest.xml with Internet permissions and Cleartext traffic");
  }
}

// 4. Overwrite all Android launcher icons with the custom QuickDoc icon
if (fs.existsSync(resDir) && fs.existsSync(iconPng)) {
  const mipmaps = [
    "mipmap-mdpi",
    "mipmap-hdpi",
    "mipmap-xhdpi",
    "mipmap-xxhdpi",
    "mipmap-xxxhdpi",
  ];

  for (const mm of mipmaps) {
    const targetDir = path.join(resDir, mm);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.copyFileSync(iconPng, path.join(targetDir, "ic_launcher.png"));
    fs.copyFileSync(iconPng, path.join(targetDir, "ic_launcher_round.png"));
    fs.copyFileSync(iconPng, path.join(targetDir, "ic_launcher_foreground.png"));
  }

  // Also remove or replace anydpi-v26 adaptive icons that override the PNG on modern Android devices
  const anydpiDir = path.join(resDir, "mipmap-anydpi-v26");
  if (fs.existsSync(anydpiDir)) {
    const files = fs.readdirSync(anydpiDir);
    for (const f of files) {
      // Remove default xml that references the old blue capacitor icon
      try {
        fs.unlinkSync(path.join(anydpiDir, f));
      } catch {}
    }
  }

  console.log("✓ Replaced all Android launcher icons with custom QuickDoc icon!");
}
