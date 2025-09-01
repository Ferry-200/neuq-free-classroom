import { ImageGenerator, ClassroomInfo } from './image-generator.js';
import { VisualizationServer } from './visualization-server.js';
import { writeFile } from 'fs/promises';
import path from 'path';

/**
 * 测试脚本 - 验证可视化功能是否正常工作
 */

async function testImageGeneration() {
    console.log('🧪 测试图片生成功能...');
    
    // 创建测试用的mock数据
    const mockClassrooms: ClassroomInfo[] = [
        { name: 'GX101', capacity: 120, isFree: true, type: '多媒体大教室', building: '工学馆' },
        { name: 'GX102', capacity: 80, isFree: false, type: '多媒体教室', building: '工学馆' },
        { name: 'GX103', capacity: 60, isFree: true, type: '普通教室', building: '工学馆' },
        { name: 'GX201', capacity: 100, isFree: true, type: '多媒体教室', building: '工学馆' },
        { name: 'GX202', capacity: 80, isFree: false, type: '多媒体教室', building: '工学馆' },
    ];

    try {
        // 测试生成图片Buffer
        const imageBuffer = await ImageGenerator.generateClassroomInfoImageBuffer(
            mockClassrooms,
            '2025-01-01',
            1
        );
        
        // 保存测试图片
        const testImagePath = path.join('test-classroom-visualization.png');
        await writeFile(testImagePath, imageBuffer);
        
        console.log('✅ 图片生成成功！');
        console.log(`📁 测试图片保存至: ${testImagePath}`);
        console.log(`📊 图片大小: ${Math.round(imageBuffer.length / 1024)} KB`);
        
        return true;
    } catch (error) {
        console.error('❌ 图片生成失败:', error);
        return false;
    }
}

async function testServerCreation() {
    console.log('🧪 测试服务器创建...');
    
    try {
        const server = new VisualizationServer(3001);
        const app = server.getApp();
        
        if (app) {
            console.log('✅ 服务器创建成功！');
            console.log('📡 Express应用实例创建正常');
            return true;
        } else {
            console.error('❌ 服务器创建失败：无法获取Express实例');
            return false;
        }
    } catch (error) {
        console.error('❌ 服务器创建失败:', error);
        return false;
    }
}

async function runTests() {
    console.log('🚀 开始运行可视化功能测试');
    console.log('='.repeat(50));
    
    const imageTest = await testImageGeneration();
    console.log('');
    
    const serverTest = await testServerCreation();
    console.log('');
    
    console.log('📋 测试结果汇总:');
    console.log(`  🖼️  图片生成: ${imageTest ? '✅ 通过' : '❌ 失败'}`);
    console.log(`  🌐 服务器创建: ${serverTest ? '✅ 通过' : '❌ 失败'}`);
    
    if (imageTest && serverTest) {
        console.log('🎉 所有测试通过！可视化功能正常工作');
        console.log('💡 提示: 运行 npm run server 启动Web服务器');
    } else {
        console.log('⚠️  部分测试失败，请检查相关功能');
    }
}

// 运行测试
runTests().catch(error => {
    console.error('测试运行时发生错误:', error);
    process.exit(1);
});