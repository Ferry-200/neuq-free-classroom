# 教室数据可视化预览功能

## 功能概述

本功能为 NEUQ 空教室查询系统添加了 Web 可视化预览界面，允许用户通过浏览器查看教室数据的可视化图表。

## 新增文件

### 1. `src/image-generator.ts`
- **作用**: 图片生成器类，使用 Canvas 将教室数据渲染为可视化图片
- **主要功能**:
  - 支持生成空教室列表的可视化图片
  - 支持生成包含详细教室信息的图片
  - 提供文件保存和 Buffer 返回两种模式
  - 包含完整的中文注释和错误处理

### 2. `src/visualization-server.ts`
- **作用**: Web 服务器类，提供可视化预览的 Web 界面
- **主要功能**:
  - 提供主页和可视化预览页面路由
  - 生成 mock 教室数据用于演示
  - 提供 API 接口返回图片和数据
  - 响应式 Web 界面设计

### 3. `src/server.ts`
- **作用**: 服务器启动入口文件
- **主要功能**:
  - 启动可视化 Web 服务器
  - 处理优雅关闭
  - 错误处理和日志输出

## 功能特性

### 🎯 核心功能
1. **Web 可视化界面**: 提供 `/visualization-preview` 路由访问可视化页面
2. **Mock 数据演示**: 使用模拟的教室数据进行功能演示
3. **Canvas 图片渲染**: 实时生成教室数据的可视化图片
4. **响应式设计**: 支持桌面和移动设备访问

### 📊 数据展示
- **时段选择**: 支持选择 1-12 节课的任意时段
- **教室信息**: 显示教室名称、容量、类型、使用状态
- **统计数据**: 显示空闲/占用教室数量统计
- **可视化图表**: 使用 Canvas 生成的图表展示

### 🔧 技术特性
- **模块化设计**: 代码结构清晰，便于维护和扩展
- **TypeScript 支持**: 完整的类型定义和类型安全
- **详细注释**: 所有类和方法都有完整的中文注释
- **错误处理**: 完善的错误处理和用户友好的错误提示

## 使用方法

### 启动服务器
```bash
# 开发模式
npm run server

# 生产模式（需要先构建）
npm run build
npm run start:server
```

### 访问页面
- **主页**: http://localhost:3000
- **可视化预览**: http://localhost:3000/visualization-preview

### API 接口
- **获取教室图片**: `GET /api/classroom-image/:period`
- **获取教室数据**: `GET /api/classroom-data/:period`

## Mock 数据说明

为了演示功能，系统使用了基于工学馆真实教室的模拟数据：

### 教室列表
- GX101-GX503：包含不同类型和容量的教室
- 类型包括：多媒体大教室、多媒体教室、普通教室、研讨室、小教室

### 使用率模拟
- **上午时段 (1-4节)**: 70% 占用率（模拟上课高峰）
- **下午时段 (5-8节)**: 50% 占用率（模拟正常使用）
- **晚上时段 (9-12节)**: 30% 占用率（模拟低峰期）

## 代码架构

### 类设计
```typescript
// 图片生成器 - 负责 Canvas 渲染
export class ImageGenerator {
    static generateImage(): Promise<void>
    static generateImageBuffer(): Promise<Buffer>
    static generateClassroomInfoImageBuffer(): Promise<Buffer>
}

// Web 服务器 - 负责 Web 界面
export class VisualizationServer {
    constructor(port: number)
    start(): void
    private setupRoutes(): void
    private generateMockClassroomData(): ClassroomInfo[]
}
```

### 接口定义
```typescript
// 教室信息接口
export interface ClassroomInfo {
    name: string;      // 教室名称
    capacity: number;  // 容量
    isFree: boolean;   // 是否空闲
    type: string;      // 教室类型
    building: string;  // 教学楼
}
```

## 未来扩展

该架构设计便于未来接入真实数据：

1. **数据源切换**: 将 `generateMockClassroomData()` 替换为真实 API 调用
2. **认证集成**: 可以集成现有的 NEUQ 教务系统认证
3. **缓存优化**: 可以添加 Redis 等缓存层提升性能
4. **更多可视化**: 可以添加更多图表类型和数据分析功能

## 注意事项

- Canvas 图片生成需要 Node.js 环境支持
- Mock 数据使用伪随机算法确保相同时段结果一致
- 响应式设计适配移动设备访问
- 所有文本内容支持中文显示