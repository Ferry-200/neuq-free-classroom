import { VisualizationServer } from './visualization-server.js';

/**
 * 启动可视化预览服务器的主入口文件
 * 提供教室数据可视化的Web界面
 */

function main() {
    console.log('🏫 NEUQ 空教室可视化系统');
    console.log('==============================');
    
    // 从环境变量获取端口，默认为3000
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    
    // 创建并启动服务器
    const server = new VisualizationServer(port);
    
    // 处理优雅关闭
    process.on('SIGINT', () => {
        console.log('\n🛑 正在关闭服务器...');
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 正在关闭服务器...');
        process.exit(0);
    });
    
    // 启动服务器
    server.start();
}

// 错误处理
process.on('unhandledRejection', (reason) => {
    console.error('未处理的Promise拒绝:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

// 启动应用
try {
    main();
} catch (error) {
    console.error('启动服务器时发生错误:', error);
    process.exit(1);
}