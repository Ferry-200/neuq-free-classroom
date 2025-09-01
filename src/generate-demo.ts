import { VisualizationServer } from './visualization-server.js';
import { writeFile } from 'fs/promises';
import path from 'path';

/**
 * 演示脚本 - 生成静态HTML文件用于演示可视化功能
 */

async function generateDemoPages() {
    console.log('🎬 生成演示页面...');
    
    try {
        const server = new VisualizationServer(3000);
        
        // 获取主页HTML
        const homePageHTML = server['generateHomePage']();
        await writeFile('demo-home.html', homePageHTML, 'utf-8');
        console.log('✅ 主页演示文件已生成: demo-home.html');
        
        // 获取可视化预览页面HTML
        const previewPageHTML = server['generateVisualizationPreviewPage']();
        await writeFile('demo-visualization-preview.html', previewPageHTML, 'utf-8');
        console.log('✅ 可视化预览演示文件已生成: demo-visualization-preview.html');
        
        // 生成一些示例图片
        for (let period = 1; period <= 3; period++) {
            const mockData = server['generateMockClassroomData'](period);
            const { ImageGenerator } = await import('./image-generator.js');
            
            const imageBuffer = await ImageGenerator.generateClassroomInfoImageBuffer(
                mockData,
                '2025-01-01',
                period
            );
            
            const imagePath = `demo-classroom-period-${period}.png`;
            await writeFile(imagePath, imageBuffer);
            console.log(`✅ 示例图片已生成: ${imagePath}`);
        }
        
        console.log('🎉 所有演示文件生成完成！');
        console.log('📁 演示文件列表:');
        console.log('  - demo-home.html (主页)');
        console.log('  - demo-visualization-preview.html (可视化预览页面)');
        console.log('  - demo-classroom-period-1.png (第1节课程图片)');
        console.log('  - demo-classroom-period-2.png (第2节课程图片)');
        console.log('  - demo-classroom-period-3.png (第3节课程图片)');
        
    } catch (error) {
        console.error('❌ 生成演示页面时发生错误:', error);
    }
}

// 运行演示生成
generateDemoPages().catch(error => {
    console.error('演示生成时发生错误:', error);
    process.exit(1);
});