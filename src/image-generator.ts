import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { writeFile } from 'fs/promises';

/**
 * 图片生成器类 - 将空教室数据渲染为图片
 * 用于将纯文本的空教室信息转换为可视化的图片格式
 */
export class ImageGenerator {
    private static readonly CANVAS_WIDTH = 800;
    private static readonly CANVAS_HEIGHT = 600;
    private static readonly PADDING = 40;
    private static readonly LINE_HEIGHT = 24;
    private static readonly FONT_SIZE = 16;
    private static readonly TITLE_FONT_SIZE = 20;
    private static readonly HEADER_COLOR = '#2c3e50';
    private static readonly TEXT_COLOR = '#34495e';
    private static readonly BACKGROUND_COLOR = '#ffffff';
    private static readonly BORDER_COLOR = '#bdc3c7';

    /**
     * 将空教室数据渲染为图片并保存到文件
     * @param classroomData 教室名称数组
     * @param filePath 输出图片文件路径
     * @param date 日期字符串
     * @param period 节次
     */
    public static async generateImage(
        classroomData: string[],
        filePath: string,
        date: string,
        period: number
    ): Promise<void> {
        try {
            // 创建画布
            const canvas = createCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            const ctx = canvas.getContext('2d');

            // 设置背景色
            ctx.fillStyle = this.BACKGROUND_COLOR;
            ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

            // 绘制标题
            this.drawTitle(ctx, date, period);

            // 绘制空教室列表
            this.drawClassroomList(ctx, classroomData);

            // 绘制边框
            this.drawBorder(ctx);

            // 绘制底部信息
            this.drawFooter(ctx);

            // 将画布内容保存为PNG文件
            const buffer = canvas.toBuffer('image/png');
            await writeFile(filePath, buffer);

            console.info(`图片已生成: ${filePath}`);
        } catch (error) {
            console.error('生成图片时发生错误:', error);
            throw error;
        }
    }

    /**
     * 绘制标题
     */
    private static drawTitle(ctx: CanvasRenderingContext2D, date: string, period: number): void {
        ctx.fillStyle = this.HEADER_COLOR;
        ctx.font = `bold ${this.TITLE_FONT_SIZE}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        
        const title = `工学馆空教室查询 - ${date} 第${period}节`;
        ctx.fillText(title, this.CANVAS_WIDTH / 2, this.PADDING + this.TITLE_FONT_SIZE);
    }

    /**
     * 绘制教室列表
     */
    private static drawClassroomList(ctx: CanvasRenderingContext2D, classroomData: string[]): void {
        ctx.fillStyle = this.TEXT_COLOR;
        ctx.font = `${this.FONT_SIZE}px Arial, sans-serif`;
        ctx.textAlign = 'left';

        const startY = this.PADDING + this.TITLE_FONT_SIZE + 40;
        const columnsPerRow = 3;
        const columnWidth = (this.CANVAS_WIDTH - 2 * this.PADDING) / columnsPerRow;

        // 如果没有空教室数据，显示提示信息
        if (classroomData.length === 0) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e74c3c';
            ctx.font = `${this.FONT_SIZE + 2}px Arial, sans-serif`;
            ctx.fillText('暂无空教室', this.CANVAS_WIDTH / 2, startY + 50);
            return;
        }

        // 绘制列表头
        ctx.fillStyle = this.HEADER_COLOR;
        ctx.font = `bold ${this.FONT_SIZE}px Arial, sans-serif`;
        ctx.fillText('空教室列表:', this.PADDING, startY);

        // 绘制教室名称
        ctx.fillStyle = this.TEXT_COLOR;
        ctx.font = `${this.FONT_SIZE}px Arial, sans-serif`;

        classroomData.forEach((classroom, index) => {
            const row = Math.floor(index / columnsPerRow);
            const col = index % columnsPerRow;
            
            const x = this.PADDING + col * columnWidth;
            const y = startY + 40 + row * this.LINE_HEIGHT;

            // 避免超出画布边界
            if (y > this.CANVAS_HEIGHT - this.PADDING - 60) {
                if (index === classroomData.length - 1) {
                    // 如果是最后一个且超出边界，显示省略号
                    ctx.fillText('...', x, y - this.LINE_HEIGHT);
                }
                return;
            }

            ctx.fillText(`• ${classroom}`, x, y);
        });

        // 显示总数
        const totalY = Math.min(
            startY + 40 + Math.ceil(classroomData.length / columnsPerRow) * this.LINE_HEIGHT + 20,
            this.CANVAS_HEIGHT - this.PADDING - 40
        );
        
        ctx.fillStyle = this.HEADER_COLOR;
        ctx.font = `bold ${this.FONT_SIZE}px Arial, sans-serif`;
        ctx.fillText(`共找到 ${classroomData.length} 间空教室`, this.PADDING, totalY);
    }

    /**
     * 绘制边框
     */
    private static drawBorder(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, this.CANVAS_WIDTH - 20, this.CANVAS_HEIGHT - 20);
    }

    /**
     * 绘制底部信息
     */
    private static drawFooter(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#95a5a6';
        ctx.font = `12px Arial, sans-serif`;
        ctx.textAlign = 'center';
        
        const footerText = '数据来源: 东北大学秦皇岛分校教务系统 | 生成时间: ' + new Date().toLocaleString('zh-CN');
        ctx.fillText(footerText, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT - 20);
    }
}