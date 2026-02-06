const fs = require('fs');
const path = require('path');

// 构建目录
const distDir = path.join(__dirname, 'dist');

// 确保构建目录存在
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 各库的目标目录
const mermaidDistDir = path.join(distDir, 'mermaid');
const katexDistDir = path.join(distDir, 'katex');

// 复制文件函数
function copyFile(src, dest) {
    try {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied: ${path.basename(src)} -> ${path.relative(__dirname, dest)}`);
    } catch (error) {
        console.error(`✗ Failed to copy ${path.basename(src)}:`, error.message);
    }
}

// 复制目录函数
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

// 要复制的文件配置
const filesToCopy = [
    // mermaid 文件
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'mermaid.esm.min.mjs'),
        dest: path.join(mermaidDistDir, 'mermaid.esm.min.mjs')
    },
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js'),
        dest: path.join(mermaidDistDir, 'mermaid.min.js')
    },
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'mermaid.js'),
        dest: path.join(mermaidDistDir, 'mermaid.js')
    },
    // katex 文件
    {
        src: path.join(__dirname, 'node_modules', 'katex', 'dist', 'katex.min.js'),
        dest: path.join(katexDistDir, 'katex.min.js')
    },
    {
        src: path.join(__dirname, 'node_modules', 'katex', 'dist', 'katex.min.css'),
        dest: path.join(katexDistDir, 'katex.min.css')
    },
    {
        src: path.join(__dirname, 'node_modules', 'katex', 'dist', 'contrib', 'auto-render.min.js'),
        dest: path.join(katexDistDir, 'katex-auto-render.min.js')
    }
];

// 要复制的目录配置
const directoriesToCopy = [
    // mermaid chunks 目录
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'chunks'),
        dest: path.join(mermaidDistDir, 'chunks')
    },
    // mermaid 其他目录
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'themes'),
        dest: path.join(mermaidDistDir, 'themes')
    },
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'diagrams'),
        dest: path.join(mermaidDistDir, 'diagrams')
    },
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'diagram-api'),
        dest: path.join(mermaidDistDir, 'diagram-api')
    },
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'rendering-util'),
        dest: path.join(mermaidDistDir, 'rendering-util')
    },
    {
        src: path.join(__dirname, 'node_modules', 'mermaid', 'dist', 'utils'),
        dest: path.join(mermaidDistDir, 'utils')
    },
    // katex 目录
    {
        src: path.join(__dirname, 'node_modules', 'katex', 'dist', 'fonts'),
        dest: path.join(katexDistDir, 'fonts')
    }
];

// 执行复制
console.log('Starting build process...');

// 复制文件
console.log('\nCopying files...');
filesToCopy.forEach(file => copyFile(file.src, file.dest));

// 复制目录
console.log('\nCopying directories...');
directoriesToCopy.forEach(dir => {
    console.log(`Copying directory: ${path.relative(__dirname, dir.src)} -> ${path.relative(__dirname, dir.dest)}`);
    copyDirectory(dir.src, dir.dest);
});

console.log('\nBuild completed!');
console.log(`Output directory: ${path.relative(__dirname, distDir)}`);
