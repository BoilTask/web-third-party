const fs = require('fs');
const path = require('path');

/**
 * 构建工具配置
 * 用于整理第三方库文件到指定目录
 */

// 主配置
const CONFIG = {
    // 输出根目录
    outputRoot: path.join(__dirname, 'dist'),
    // 日志配置
    log: {
        enabled: true,
        verbose: false
    }
};

/**
 * 库配置列表
 * 每个库包含：
 * - name: 库名称
 * - source: 源文件目录（相对于 node_modules）
 * - target: 目标目录（相对于 outputRoot）
 * - files: 要复制的单个文件列表
 * - directories: 要复制的目录列表
 */
const LIBRARIES = [
    {
        name: 'mermaid',
        source: path.join(__dirname, 'node_modules', 'mermaid', 'dist'),
        target: 'mermaid',
        files: [
            { src: 'mermaid.esm.min.mjs', dest: 'mermaid.esm.min.mjs' },
            { src: 'mermaid.min.js', dest: 'mermaid.min.js' },
            { src: 'mermaid.js', dest: 'mermaid.js' }
        ],
        directories: [
            { src: 'chunks', dest: 'chunks' },
            { src: 'themes', dest: 'themes' },
            { src: 'diagrams', dest: 'diagrams' },
            { src: 'diagram-api', dest: 'diagram-api' },
            { src: 'rendering-util', dest: 'rendering-util' },
            { src: 'utils', dest: 'utils' }
        ]
    },
    {
        name: 'katex',
        source: path.join(__dirname, 'node_modules', 'katex', 'dist'),
        target: 'katex',
        files: [
            { src: 'katex.min.js', dest: 'katex.min.js' },
            { src: 'katex.min.css', dest: 'katex.min.css' },
            { src: path.join('contrib', 'auto-render.min.js'), dest: 'katex-auto-render.min.js' }
        ],
        directories: [
            { src: 'fonts', dest: 'fonts' }
        ]
    }
];

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`✓ Created directory: ${path.relative(__dirname, dirPath)}`);
    }
}

/**
 * 日志函数
 * @param {string} message - 日志消息
 * @param {string} type - 日志类型：info, error, success
 */
function log(message, type = 'info') {
    if (!CONFIG.log.enabled) return;
    
    switch (type) {
        case 'success':
            console.log(`✓ ${message}`);
            break;
        case 'error':
            console.error(`✗ ${message}`);
            break;
        case 'info':
        default:
            console.log(`  ${message}`);
            break;
    }
}

/**
 * 复制单个文件
 * @param {string} src - 源文件路径
 * @param {string} dest - 目标文件路径
 * @returns {boolean} - 是否复制成功
 */
function copyFile(src, dest) {
    try {
        ensureDirectoryExists(path.dirname(dest));
        fs.copyFileSync(src, dest);
        log(`Copied: ${path.basename(src)} -> ${path.relative(__dirname, dest)}`, 'success');
        return true;
    } catch (error) {
        log(`Failed to copy ${path.basename(src)}: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 递归复制目录
 * @param {string} srcDir - 源目录路径
 * @param {string} destDir - 目标目录路径
 */
function copyDirectory(srcDir, destDir) {
    ensureDirectoryExists(destDir);
    
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

/**
 * 复制单个库的文件
 * @param {Object} library - 库配置
 */
function copyLibrary(library) {
    log(`\n=== Processing library: ${library.name} ===`);
    
    const libraryTarget = path.join(CONFIG.outputRoot, library.target);
    ensureDirectoryExists(libraryTarget);
    
    // 复制单个文件
    if (library.files && library.files.length > 0) {
        log('Copying files...');
        library.files.forEach(file => {
            const srcPath = path.join(library.source, file.src);
            const destPath = path.join(libraryTarget, file.dest);
            copyFile(srcPath, destPath);
        });
    }
    
    // 复制目录
    if (library.directories && library.directories.length > 0) {
        log('Copying directories...');
        library.directories.forEach(dir => {
            const srcPath = path.join(library.source, dir.src);
            const destPath = path.join(libraryTarget, dir.dest);
            log(`Copying directory: ${path.relative(__dirname, srcPath)} -> ${path.relative(__dirname, destPath)}`);
            copyDirectory(srcPath, destPath);
        });
    }
    
    log(`=== Finished processing: ${library.name} ===`);
}

/**
 * 主构建函数
 */
function build() {
    log('Starting build process...', 'info');
    
    // 确保输出根目录存在
    ensureDirectoryExists(CONFIG.outputRoot);
    
    // 处理每个库
    LIBRARIES.forEach(library => {
        copyLibrary(library);
    });
    
    log('\nBuild completed successfully!', 'success');
    log(`Output directory: ${path.relative(__dirname, CONFIG.outputRoot)}`, 'info');
}

// 执行构建
build();

/**
 * 导出函数（用于后续可能的扩展）
 */
module.exports = {
    build,
    CONFIG,
    LIBRARIES
};
