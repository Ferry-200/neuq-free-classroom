import express from 'express';
import path from 'path';
import { ImageGenerator, ClassroomInfo } from './image-generator.js';
import { DateTime } from 'luxon';

/**
 * Web服务器类 - 提供教室数据可视化预览页面
 * 主要功能：
 * 1. 提供主页和可视化预览页面
 * 2. 生成mock教室数据的可视化图片
 * 3. 支持实时图片生成和响应
 */
export class VisualizationServer {
    private app: express.Application;
    private port: number;

    constructor(port: number = 3000) {
        this.app = express();
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * 设置中间件
     */
    private setupMiddleware(): void {
        // 设置静态文件服务
        this.app.use('/static', express.static(path.join(process.cwd(), 'public')));
        
        // 设置JSON解析
        this.app.use(express.json());
        
        // 设置响应头
        this.app.use((_req, res, next) => {
            res.header('Content-Type', 'text/html; charset=utf-8');
            next();
        });
    }

    /**
     * 设置路由
     */
    private setupRoutes(): void {
        // 主页路由
        this.app.get('/', (_req, res) => {
            res.send(this.generateHomePage());
        });

        // 可视化预览页面路由
        this.app.get('/visualization-preview', (_req, res) => {
            res.send(this.generateVisualizationPreviewPage());
        });

        // 图片生成API路由
        this.app.get('/api/classroom-image/:period', async (req, res) => {
            try {
                const period = parseInt(req.params.period);
                if (isNaN(period) || period < 1 || period > 12) {
                    res.status(400).send('Invalid period');
                    return;
                }

                const mockData = this.generateMockClassroomData(period);
                const date = DateTime.now().setZone('Asia/Shanghai').toFormat('yyyy-MM-dd');
                
                const imageBuffer = await ImageGenerator.generateClassroomInfoImageBuffer(
                    mockData,
                    date,
                    period
                );

                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Cache-Control', 'public, max-age=300'); // 5分钟缓存
                res.send(imageBuffer);
            } catch (error) {
                console.error('生成图片时发生错误:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        // 获取mock教室数据API
        this.app.get('/api/classroom-data/:period', (req, res) => {
            try {
                const period = parseInt(req.params.period);
                if (isNaN(period) || period < 1 || period > 12) {
                    res.status(400).json({ error: 'Invalid period' });
                    return;
                }

                const mockData = this.generateMockClassroomData(period);
                res.json({
                    date: DateTime.now().setZone('Asia/Shanghai').toFormat('yyyy-MM-dd'),
                    period: period,
                    building: '工学馆',
                    classrooms: mockData
                });
            } catch (error) {
                console.error('获取教室数据时发生错误:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }

    /**
     * 生成主页HTML
     */
    private generateHomePage(): string {
        return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NEUQ 空教室查询系统</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .container {
                    text-align: center;
                    max-width: 800px;
                    padding: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                
                h1 {
                    font-size: 3rem;
                    margin-bottom: 20px;
                    font-weight: 300;
                }
                
                .subtitle {
                    font-size: 1.2rem;
                    margin-bottom: 40px;
                    opacity: 0.9;
                }
                
                .features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                
                .feature {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .feature h3 {
                    margin-bottom: 10px;
                    color: #ffd700;
                }
                
                .cta-button {
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                }
                
                .footer {
                    margin-top: 40px;
                    opacity: 0.7;
                    font-size: 0.9rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏫 NEUQ 空教室查询</h1>
                <p class="subtitle">东北大学秦皇岛分校空教室可视化查询系统</p>
                
                <div class="features">
                    <div class="feature">
                        <h3>📊 可视化展示</h3>
                        <p>通过图表和图像直观展示教室使用情况</p>
                    </div>
                    <div class="feature">
                        <h3>🕐 实时查询</h3>
                        <p>支持查询当日各个时段的空教室信息</p>
                    </div>
                    <div class="feature">
                        <h3>🖼️ 图片导出</h3>
                        <p>将教室数据渲染为高质量图片便于分享</p>
                    </div>
                </div>
                
                <a href="/visualization-preview" class="cta-button">
                    🎯 查看可视化预览
                </a>
                
                <div class="footer">
                    <p>数据来源：东北大学秦皇岛分校教务系统</p>
                    <p>本项目仅供学习研究使用</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * 生成可视化预览页面HTML
     */
    private generateVisualizationPreviewPage(): string {
        const currentDate = DateTime.now().setZone('Asia/Shanghai').toFormat('yyyy-MM-dd');
        
        return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>教室数据可视化预览 - NEUQ 空教室查询</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    background: #f5f6fa;
                    min-height: 100vh;
                    color: #2c3e50;
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px 0;
                    text-align: center;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    font-weight: 300;
                }
                
                .header .subtitle {
                    font-size: 1.2rem;
                    opacity: 0.9;
                }
                
                .nav {
                    padding: 20px;
                    background: white;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                
                .back-button {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background 0.3s ease;
                }
                
                .back-button:hover {
                    background: #2980b9;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .period-selector {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    margin-bottom: 30px;
                    text-align: center;
                }
                
                .period-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 15px;
                }
                
                .period-btn {
                    padding: 10px 20px;
                    background: #ecf0f1;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: bold;
                }
                
                .period-btn:hover {
                    background: #bdc3c7;
                }
                
                .period-btn.active {
                    background: #e74c3c;
                    color: white;
                }
                
                .visualization-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                
                .visualization-card {
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease;
                }
                
                .visualization-card:hover {
                    transform: translateY(-5px);
                }
                
                .card-title {
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                
                .image-container {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .classroom-image {
                    max-width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    border: 2px solid #ecf0f1;
                }
                
                .classroom-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px solid #ecf0f1;
                }
                
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #7f8c8d;
                }
                
                .error {
                    background: #e74c3c;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                }
                
                @media (max-width: 768px) {
                    .visualization-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .period-buttons {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    
                    .header h1 {
                        font-size: 2rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 教室数据可视化预览</h1>
                <p class="subtitle">工学馆教室使用情况 - ${currentDate}</p>
            </div>
            
            <div class="nav">
                <a href="/" class="back-button">← 返回主页</a>
            </div>
            
            <div class="container">
                <div class="period-selector">
                    <h3>选择查询时段</h3>
                    <div class="period-buttons">
                        ${Array.from({length: 12}, (_, i) => i + 1).map(period => 
                            `<button class="period-btn" onclick="loadPeriodData(${period})" data-period="${period}">第${period}节</button>`
                        ).join('')}
                    </div>
                </div>
                
                <div id="visualization-content">
                    <div class="loading">
                        <h3>请选择时段查看可视化数据</h3>
                        <p>点击上方按钮选择要查看的课程时段</p>
                    </div>
                </div>
            </div>
            
            <script>
                let currentPeriod = null;
                
                /**
                 * 加载指定时段的数据
                 * @param {number} period 时段编号 (1-12)
                 */
                async function loadPeriodData(period) {
                    // 更新按钮状态
                    document.querySelectorAll('.period-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.querySelector(\`[data-period="\${period}"]\`).classList.add('active');
                    
                    currentPeriod = period;
                    
                    // 显示加载状态
                    const content = document.getElementById('visualization-content');
                    content.innerHTML = '<div class="loading"><h3>正在加载数据...</h3></div>';
                    
                    try {
                        // 并行获取图片和数据
                        const [imageResponse, dataResponse] = await Promise.all([
                            fetch(\`/api/classroom-image/\${period}\`),
                            fetch(\`/api/classroom-data/\${period}\`)
                        ]);
                        
                        if (!imageResponse.ok || !dataResponse.ok) {
                            throw new Error('Failed to fetch data');
                        }
                        
                        const data = await dataResponse.json();
                        const imageBlob = await imageResponse.blob();
                        const imageUrl = URL.createObjectURL(imageBlob);
                        
                        // 渲染可视化内容
                        renderVisualization(data, imageUrl, period);
                        
                    } catch (error) {
                        console.error('加载数据时发生错误:', error);
                        content.innerHTML = '<div class="error">加载数据时发生错误，请稍后重试</div>';
                    }
                }
                
                /**
                 * 渲染可视化内容
                 * @param {Object} data 教室数据
                 * @param {string} imageUrl 图片URL
                 * @param {number} period 时段编号
                 */
                function renderVisualization(data, imageUrl, period) {
                    const content = document.getElementById('visualization-content');
                    
                    const freeClassrooms = data.classrooms.filter(room => room.isFree);
                    const occupiedClassrooms = data.classrooms.filter(room => !room.isFree);
                    
                    content.innerHTML = \`
                        <div class="visualization-grid">
                            <div class="visualization-card">
                                <h2 class="card-title">📊 可视化图表</h2>
                                <div class="image-container">
                                    <img src="\${imageUrl}" alt="第\${period}节教室使用情况" class="classroom-image">
                                </div>
                                <div class="classroom-info">
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <span>📅 查询日期:</span>
                                            <strong>\${data.date}</strong>
                                        </div>
                                        <div class="info-item">
                                            <span>🕐 时段:</span>
                                            <strong>第\${data.period}节</strong>
                                        </div>
                                        <div class="info-item">
                                            <span>🏢 教学楼:</span>
                                            <strong>\${data.building}</strong>
                                        </div>
                                        <div class="info-item">
                                            <span>📊 总教室数:</span>
                                            <strong>\${data.classrooms.length}间</strong>
                                        </div>
                                        <div class="info-item">
                                            <span>✅ 空闲教室:</span>
                                            <strong style="color: #27ae60">\${freeClassrooms.length}间</strong>
                                        </div>
                                        <div class="info-item">
                                            <span>❌ 已占用:</span>
                                            <strong style="color: #e74c3c">\${occupiedClassrooms.length}间</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="visualization-card">
                                <h2 class="card-title">📝 详细信息</h2>
                                <div class="classroom-info">
                                    <h4 style="color: #27ae60; margin-bottom: 10px;">✅ 空闲教室 (\${freeClassrooms.length}间)</h4>
                                    \${freeClassrooms.length > 0 ? 
                                        freeClassrooms.map(room => \`
                                            <div class="info-item">
                                                <span>\${room.name}</span>
                                                <span>\${room.capacity}人 | \${room.type}</span>
                                            </div>
                                        \`).join('') : 
                                        '<p style="color: #7f8c8d; font-style: italic;">暂无空闲教室</p>'
                                    }
                                    
                                    <h4 style="color: #e74c3c; margin: 20px 0 10px 0;">❌ 已占用教室 (\${occupiedClassrooms.length}间)</h4>
                                    \${occupiedClassrooms.length > 0 ? 
                                        occupiedClassrooms.slice(0, 5).map(room => \`
                                            <div class="info-item">
                                                <span>\${room.name}</span>
                                                <span>\${room.capacity}人 | \${room.type}</span>
                                            </div>
                                        \`).join('') + 
                                        (occupiedClassrooms.length > 5 ? '<p style="color: #7f8c8d; font-style: italic;">... 还有' + (occupiedClassrooms.length - 5) + '间已占用教室</p>' : '') :
                                        '<p style="color: #7f8c8d; font-style: italic;">无已占用教室</p>'
                                    }
                                </div>
                            </div>
                        </div>
                    \`;
                }
                
                // 页面加载完成后默认加载第1节的数据
                document.addEventListener('DOMContentLoaded', function() {
                    loadPeriodData(1);
                });
            </script>
        </body>
        </html>
        `;
    }

    /**
     * 生成mock教室数据
     * 模拟真实教室的使用情况，用于演示可视化功能
     * @param period 课程时段 (1-12)
     * @returns 教室信息数组
     */
    private generateMockClassroomData(period: number): ClassroomInfo[] {
        // 工学馆教室列表 (基于真实教室名称)
        const baseClassrooms = [
            { name: 'GX101', capacity: 120, type: '多媒体大教室' },
            { name: 'GX102', capacity: 80, type: '多媒体教室' },
            { name: 'GX103', capacity: 60, type: '普通教室' },
            { name: 'GX201', capacity: 100, type: '多媒体教室' },
            { name: 'GX202', capacity: 80, type: '多媒体教室' },
            { name: 'GX203', capacity: 60, type: '普通教室' },
            { name: 'GX301', capacity: 120, type: '多媒体大教室' },
            { name: 'GX302', capacity: 80, type: '多媒体教室' },
            { name: 'GX303', capacity: 60, type: '普通教室' },
            { name: 'GX401', capacity: 100, type: '多媒体教室' },
            { name: 'GX402', capacity: 80, type: '多媒体教室' },
            { name: 'GX403', capacity: 60, type: '普通教室' },
            { name: 'GX501', capacity: 40, type: '研讨室' },
            { name: 'GX502', capacity: 40, type: '研讨室' },
            { name: 'GX503', capacity: 30, type: '小教室' },
        ];

        // 根据时段模拟不同的使用率
        // 上午时段 (1-4节) 使用率较高
        // 下午时段 (5-8节) 使用率中等  
        // 晚上时段 (9-12节) 使用率较低
        let occupancyRate: number;
        if (period >= 1 && period <= 4) {
            occupancyRate = 0.7; // 70% 占用率
        } else if (period >= 5 && period <= 8) {
            occupancyRate = 0.5; // 50% 占用率
        } else {
            occupancyRate = 0.3; // 30% 占用率
        }

        return baseClassrooms.map((classroom, index) => {
            // 使用伪随机数确保相同时段的结果一致
            const seed = period * 1000 + index;
            const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
            
            return {
                name: classroom.name,
                capacity: classroom.capacity,
                type: classroom.type,
                building: '工学馆',
                isFree: pseudoRandom > occupancyRate
            };
        });
    }

    /**
     * 启动服务器
     */
    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`🚀 可视化服务器已启动`);
            console.log(`📱 主页: http://localhost:${this.port}`);
            console.log(`📊 可视化预览: http://localhost:${this.port}/visualization-preview`);
            console.log(`💡 提示: 使用 Ctrl+C 停止服务器`);
        });
    }

    /**
     * 获取Express应用实例
     */
    public getApp(): express.Application {
        return this.app;
    }
}