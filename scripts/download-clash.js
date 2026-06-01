const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Clash版本
const CLASH_VERSION = 'v1.18.0';

// 下载配置
const downloads = {
  'win32-x64': {
    url: `https://github.com/Dreamacro/clash/releases/download/${CLASH_VERSION}/clash-windows-amd64-${CLASH_VERSION}.zip`,
    filename: 'clash-windows-amd64.exe',
    target: 'clash-windows-amd64.exe'
  },
  'darwin-x64': {
    url: `https://github.com/Dreamacro/clash/releases/download/${CLASH_VERSION}/clash-darwin-amd64-${CLASH_VERSION}.gz`,
    filename: 'clash-darwin-amd64',
    target: 'clash-darwin-amd64'
  },
  'darwin-arm64': {
    url: `https://github.com/Dreamacro/clash/releases/download/${CLASH_VERSION}/clash-darwin-arm64-${CLASH_VERSION}.gz`,
    filename: 'clash-darwin-arm64',
    target: 'clash-darwin-arm64'
  },
  'linux-x64': {
    url: `https://github.com/Dreamacro/clash/releases/download/${CLASH_VERSION}/clash-linux-amd64-${CLASH_VERSION}.gz`,
    filename: 'clash-linux-amd64',
    target: 'clash-linux-amd64'
  }
};

const assetsDir = path.join(__dirname, '..', 'assets', 'clash');

// 确保目录存在
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 下载文件
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { followRedirect: true }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // 重定向
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// 解压gz文件
function extractGz(gzPath, destPath) {
  try {
    execSync(`gunzip -c "${gzPath}" > "${destPath}"`, { stdio: 'inherit' });
    fs.chmodSync(destPath, 0o755);
    fs.unlinkSync(gzPath);
    console.log(`解压完成: ${destPath}`);
  } catch (error) {
    console.error(`解压失败: ${error.message}`);
    throw error;
  }
}

// 解压zip文件
function extractZip(zipPath, destDir) {
  try {
    execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'inherit' });
    fs.unlinkSync(zipPath);
    console.log(`解压完成: ${destDir}`);
  } catch (error) {
    console.error(`解压失败: ${error.message}`);
    throw error;
  }
}

// 主函数
async function main() {
  console.log('开始下载Clash核心...');
  
  for (const [platform, config] of Object.entries(downloads)) {
    console.log(`\n下载 ${platform}...`);
    
    const downloadPath = path.join(assetsDir, config.filename + (config.url.endsWith('.gz') ? '.gz' : '.zip'));
    const targetPath = path.join(assetsDir, config.target);
    
    try {
      // 下载
      await downloadFile(config.url, downloadPath);
      console.log(`下载完成: ${downloadPath}`);
      
      // 解压
      if (config.url.endsWith('.gz')) {
        extractGz(downloadPath, targetPath);
      } else if (config.url.endsWith('.zip')) {
        extractZip(downloadPath, assetsDir);
      }
      
      console.log(`${platform} 处理完成`);
    } catch (error) {
      console.error(`${platform} 处理失败:`, error.message);
    }
  }
  
  console.log('\n所有平台下载完成！');
}

main().catch(console.error);