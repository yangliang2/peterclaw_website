#!/usr/bin/env python3
"""
Generate comparison reference images for AI tool review article.
These are illustrative reference diagrams created by the review team
to visualize the described differences between Midjourney v7, Flux, and Ideogram.
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "public/images/blog/ai-tool-review-midjourney-flux-ideogram"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_font(size):
    """Try to find a suitable font with CJK support."""
    font_paths = [
        ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 0),
        ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", 0),
        ("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", 0),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", None),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", None),
        ("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", None),
        ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", None),
    ]
    for path, index in font_paths:
        if os.path.exists(path):
            try:
                if index is not None:
                    return ImageFont.truetype(path, size, index=index)
                else:
                    return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def create_three_panel(title, subtitle, panels, winner, filename):
    """Create a 3-panel comparison image."""
    W, H = 1800, 1000
    PADDING = 30
    HEADER_H = 100
    FOOTER_H = 60
    
    img = Image.new("RGB", (W, H), "#fafafa")
    draw = ImageDraw.Draw(img)
    
    title_font = get_font(32)
    subtitle_font = get_font(18)
    panel_title_font = get_font(22)
    body_font = get_font(16)
    winner_font = get_font(20)
    
    # Header background
    draw.rectangle([0, 0, W, HEADER_H], fill="#1a1a2e")
    
    # Title
    draw.text((W//2, 30), title, fill="white", font=title_font, anchor="mm")
    draw.text((W//2, 70), subtitle, fill="#cccccc", font=subtitle_font, anchor="mm")
    
    # Panel dimensions
    panel_w = (W - 4 * PADDING) // 3
    panel_h = H - HEADER_H - FOOTER_H - 3 * PADDING
    panel_y = HEADER_H + PADDING
    
    colors = ["#e94560", "#0f3460", "#533483"]  # MJ, Flux, Ideogram brand-ish colors
    panel_bg = ["#fff5f5", "#f0f7ff", "#f8f5ff"]
    
    for i, (tool_name, traits, notes) in enumerate(panels):
        x = PADDING + i * (panel_w + PADDING)
        
        # Panel background
        draw.rectangle([x, panel_y, x + panel_w, panel_y + panel_h], 
                       fill=panel_bg[i], outline=colors[i], width=3)
        
        # Tool name header
        draw.rectangle([x, panel_y, x + panel_w, panel_y + 50], fill=colors[i])
        draw.text((x + panel_w//2, panel_y + 25), tool_name, 
                  fill="white", font=panel_title_font, anchor="mm")
        
        # Visual illustration area
        ill_y = panel_y + 60
        ill_h = 280
        draw.rectangle([x + 10, ill_y, x + panel_w - 10, ill_y + ill_h], 
                       fill="white", outline="#dddddd", width=1)
        
        # Draw simplified illustration based on traits
        cx = x + panel_w // 2
        if "产品摄影" in title or "Product" in str(traits):
            # Earbuds illustration
            draw_earbuds_illustration(draw, cx, ill_y + ill_h//2, i)
        elif "插画" in title or "Concept" in str(traits):
            # Fantasy city illustration
            draw_fantasy_illustration(draw, cx, ill_y + ill_h//2, i)
        elif "社媒" in title or "Social" in str(traits):
            # Social media post illustration
            draw_social_illustration(draw, cx, ill_y + ill_h//2, i, notes)
        elif "中文" in title or "Chinese" in str(traits):
            # Chinese poster illustration
            draw_chinese_illustration(draw, cx, ill_y + ill_h//2, i, notes)
        
        # Notes text
        text_y = ill_y + ill_h + 20
        for line in notes:
            draw.text((x + 15, text_y), "• " + line, fill="#333333", font=body_font)
            text_y += 26
        
        # Traits badges
        badge_y = panel_y + panel_h - 40
        for j, trait in enumerate(traits):
            bw = len(trait) * 14 + 20
            bx = x + 15 + j * (bw + 10)
            if bx + bw > x + panel_w - 10:
                break
            draw.rounded_rectangle([bx, badge_y, bx + bw, badge_y + 28], 
                                   radius=4, fill=colors[i])
            draw.text((bx + bw//2, badge_y + 14), trait, 
                      fill="white", font=body_font, anchor="mm")
    
    # Footer winner
    draw.rectangle([0, H - FOOTER_H, W, H], fill="#2d6a4f")
    draw.text((W//2, H - FOOTER_H//2), f"🏆 本轮胜者：{winner}", 
              fill="white", font=winner_font, anchor="mm")
    
    img.save(os.path.join(OUTPUT_DIR, filename), quality=95)
    print(f"Generated: {filename}")

def draw_earbuds_illustration(draw, cx, cy, tool_idx):
    """Draw simplified earbuds product shot."""
    # Surface
    draw.rectangle([cx - 120, cy + 40, cx + 120, cy + 80], fill="#b0b0b0")
    
    # Earbuds case
    draw.rounded_rectangle([cx - 40, cy - 30, cx + 40, cy + 40], 
                           radius=15, fill="#222222", outline="#444444", width=2)
    
    if tool_idx == 0:  # Midjourney - artistic, slightly off angle
        draw.polygon([(cx - 60, cy - 50), (cx + 80, cy - 80), (cx + 100, cy - 40)], 
                     fill="#d4a574")
        draw.text((cx, cy + 100), "光影氛围极佳", fill="#e94560", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 120), "角度偏正面", fill="#e94560", font=get_font(14), anchor="mm")
    elif tool_idx == 1:  # Flux - precise, realistic
        draw.polygon([(cx - 50, cy - 60), (cx + 50, cy - 60), (cx + 70, cy - 30)], 
                     fill="#c4a574")
        draw.text((cx, cy + 100), "45°角精确", fill="#0f3460", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 120), "材质反射真实", fill="#0f3460", font=get_font(14), anchor="mm")
    else:  # Ideogram - flatter, text-capable
        draw.rectangle([cx - 50, cy - 60, cx + 50, cy - 30], fill="#c4a574")
        draw.text((cx, cy + 100), "可渲染产品名", fill="#533483", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 120), "材质偏塑料感", fill="#533483", font=get_font(14), anchor="mm")

def draw_fantasy_illustration(draw, cx, cy, tool_idx):
    """Draw simplified fantasy city illustration."""
    # Clouds
    draw.ellipse([cx - 100, cy + 20, cx + 100, cy + 90], fill="#f0e6d2")
    
    # City/buildings
    if tool_idx == 0:  # Midjourney - stunning, artistic
        draw.polygon([(cx - 80, cy - 40), (cx - 40, cy - 100), (cx, cy - 60)], 
                     fill="#d4a574", outline="#c49444")
        draw.polygon([(cx + 20, cy - 50), (cx + 60, cy - 110), (cx + 100, cy - 30)], 
                     fill="#e8c494", outline="#c49444")
        # Phoenix
        draw.polygon([(cx - 30, cy + 60), (cx, cy + 20), (cx + 30, cy + 60)], 
                     fill="#ff6b35")
        draw.text((cx, cy + 100), "美学惊艳 电影感", fill="#e94560", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 120), "水彩晕染恰到好处", fill="#e94560", font=get_font(14), anchor="mm")
    elif tool_idx == 1:  # Flux - accurate but less artistic
        draw.rectangle([cx - 70, cy - 60, cx - 30, cy + 20], fill="#c4a574")
        draw.rectangle([cx + 10, cy - 70, cx + 50, cy + 20], fill="#d4b484")
        # Phoenix - more rigid
        draw.polygon([(cx - 20, cy + 50), (cx, cy + 30), (cx + 20, cy + 50)], 
                     fill="#e85d35")
        draw.text((cx, cy + 100), "构图准确", fill="#0f3460", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 120), "手绘感不足", fill="#0f3460", font=get_font(14), anchor="mm")
    else:  # Ideogram - flatter, text capable
        draw.rectangle([cx - 60, cy - 50, cx - 20, cy + 30], fill="#b49464")
        draw.rectangle([cx + 20, cy - 50, cx + 60, cy + 30], fill="#c4a474")
        # Simple bird
        draw.ellipse([cx - 15, cy + 40, cx + 15, cy + 60], fill="#d47435")
        draw.text((cx, cy + 100), "可添加诗句标题", fill="#533483", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 120), "风格化较弱", fill="#533483", font=get_font(14), anchor="mm")

def draw_social_illustration(draw, cx, cy, tool_idx, notes):
    """Draw simplified social media post."""
    # Mountain background
    draw.polygon([(cx - 120, cy + 80), (cx - 40, cy - 60), (cx + 40, cy - 20), (cx + 120, cy + 80)], 
                 fill="#d4a574")
    # Sun
    draw.ellipse([cx - 30, cy - 80, cx + 30, cy - 20], fill="#ffaa44")
    
    if tool_idx == 0:  # Midjourney - text fails
        draw.rectangle([cx - 100, cy - 20, cx + 100, cy + 30], fill="rgba(0,0,0,128)")
        draw.text((cx, cy + 5), "STAR T BEFOR YOURE", fill="#ff4444", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 105), "文字几乎必定出错", fill="#e94560", font=get_font(14), anchor="mm")
    elif tool_idx == 1:  # Flux - text sometimes works
        draw.rectangle([cx - 100, cy - 20, cx + 100, cy + 30], fill="rgba(0,0,0,128)")
        draw.text((cx, cy + 5), "START BEFORE READY", fill="#ffaa44", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 105), "文字约60-70%成功率", fill="#0f3460", font=get_font(14), anchor="mm")
    else:  # Ideogram - text perfect
        draw.rectangle([cx - 100, cy - 20, cx + 100, cy + 30], fill="rgba(0,0,0,128)")
        draw.text((cx, cy + 5), "START BEFORE YOU'RE READY", fill="white", font=get_font(14), anchor="mm")
        draw.text((cx, cy + 105), "文字100%正确", fill="#533483", font=get_font(14), anchor="mm")

def draw_chinese_illustration(draw, cx, cy, tool_idx, notes):
    """Draw simplified Chinese New Year poster."""
    # Red background area
    draw.rectangle([cx - 120, cy - 80, cx + 120, cy + 80], fill="#cc2222")
    
    # Cloud patterns
    draw.ellipse([cx - 100, cy - 70, cx - 40, cy - 30], fill="#d4a520")
    draw.ellipse([cx + 40, cy - 70, cx + 100, cy - 30], fill="#d4a520")
    
    # Dragon
    if tool_idx == 0:  # Midjourney - dragon good, text fails
        draw.ellipse([cx - 30, cy - 10, cx + 30, cy + 50], fill="#ffaa22")
        draw.text((cx, cy - 40), "龍年大吉", fill="#ff4444", font=get_font(16), anchor="mm")
        draw.text((cx, cy + 100), "中文文字乱码/扭曲", fill="#e94560", font=get_font(14), anchor="mm")
    elif tool_idx == 1:  # Flux - dragon ok, text poor
        draw.ellipse([cx - 25, cy - 5, cx + 25, cy + 45], fill="#e8a020")
        draw.text((cx, cy - 40), "龙年???", fill="#ffaa44", font=get_font(16), anchor="mm")
        draw.text((cx, cy + 100), "中文约20-30%成功率", fill="#0f3460", font=get_font(14), anchor="mm")
    else:  # Ideogram - dragon cute, text good
        draw.ellipse([cx - 25, cy, cx + 25, cy + 50], fill="#ffcc44")
        draw.text((cx, cy - 40), "龙年大吉", fill="white", font=get_font(16), anchor="mm")
        draw.text((cx, cy + 100), "中文约85-90%正确", fill="#533483", font=get_font(14), anchor="mm")

def create_overall_chart():
    """Create overall comparison radar/score chart."""
    W, H = 1600, 900
    img = Image.new("RGB", (W, H), "#fafafa")
    draw = ImageDraw.Draw(img)
    
    title_font = get_font(36)
    subtitle_font = get_font(20)
    label_font = get_font(18)
    score_font = get_font(16)
    
    # Header
    draw.rectangle([0, 0, W, 100], fill="#1a1a2e")
    draw.text((W//2, 35), "AI 图像生成工具综合对比总表", fill="white", font=title_font, anchor="mm")
    draw.text((W//2, 75), "基于 2026 年 5 月多维度实测与 benchmark 数据", 
              fill="#cccccc", font=subtitle_font, anchor="mm")
    
    # Dimensions
    dims = [
        ("艺术/美学品质", [5, 4, 3]),
        ("照片级真实感", [4, 5, 3]),
        ("Prompt 精确遵从", [3, 5, 4]),
        ("图中文字渲染", [2, 3, 5]),
        ("中文文字渲染", [1, 2, 5]),
        ("价格友好度", [3, 5, 4]),
        ("API / 自动化集成", [1, 5, 4]),
        ("上手门槛", [4, 3, 5]),
    ]
    
    tools = ["Midjourney v7", "Flux (FLUX.2 Pro)", "Ideogram 3.0"]
    colors = ["#e94560", "#0f3460", "#533483"]
    
    # Draw table
    col_w = 180
    row_h = 60
    start_x = 100
    start_y = 140
    
    # Header row
    draw.rectangle([start_x, start_y, start_x + col_w + 3 * col_w, start_y + row_h], fill="#2d6a4f")
    draw.text((start_x + col_w//2, start_y + row_h//2), "评测维度", fill="white", font=label_font, anchor="mm")
    for i, tool in enumerate(tools):
        draw.text((start_x + col_w + i * col_w + col_w//2, start_y + row_h//2), 
                  tool, fill="white", font=label_font, anchor="mm")
    
    for j, (dim, scores) in enumerate(dims):
        y = start_y + (j + 1) * row_h
        bg = "#f0f0f0" if j % 2 == 0 else "white"
        draw.rectangle([start_x, y, start_x + col_w + 3 * col_w, y + row_h], fill=bg, outline="#dddddd")
        draw.text((start_x + 10, y + row_h//2), dim, fill="#333", font=label_font, anchor="lm")
        
        for i, score in enumerate(scores):
            x = start_x + col_w + i * col_w
            cx = x + col_w // 2
            cy = y + row_h // 2
            # Star rating
            stars = "★" * score + "☆" * (5 - score)
            draw.text((cx, cy), stars, fill=colors[i], font=get_font(20), anchor="mm")
            draw.text((cx + 80, cy), str(score), fill=colors[i], font=score_font, anchor="mm")
    
    # Summary box
    box_y = start_y + (len(dims) + 2) * row_h
    draw.rectangle([start_x, box_y, W - start_x, box_y + 180], fill="#e8f4f8", outline="#2d6a4f", width=2)
    draw.text((W//2, box_y + 30), "场景速查", fill="#1a1a2e", font=get_font(24), anchor="mm")
    
    scenarios = [
        "📚 书籍/专辑封面 → Midjourney v7（美学天花板）",
        "📱 社媒日常运营 → Ideogram 3.0（文字即成品）",
        "🛒 电商产品图 → Flux FLUX.2 Pro（真实感+可控性）",
        "🖨️ 印刷物料 → Flux + Ideogram + Midjourney 组合",
    ]
    for i, s in enumerate(scenarios):
        draw.text((start_x + 20, box_y + 60 + i * 28), s, fill="#333", font=label_font)
    
    # Source note
    draw.text((W//2, H - 30), 
              "数据来源：ZSky AI 2026 万人图像测试、AI Video Bootcamp 30 组标准化 prompt 对比、Melies 20 模型横向评测、官方文档与社区实测",
              fill="#888", font=get_font(14), anchor="mm")
    
    img.save(os.path.join(OUTPUT_DIR, "comparison-overall-chart.png"), quality=95)
    print(f"Generated: comparison-overall-chart.png")

if __name__ == "__main__":
    # Scenario 1: Product Photography
    create_three_panel(
        "对比 1：产品摄影",
        "Prompt：高端无线耳机产品照，哑光混凝土表面，左侧柔光，浅景深，哑光黑配铜色点缀，灰绿渐变背景，45度角，商业摄影风格",
        [
            ("Midjourney v7", ["光影氛围佳", "艺术感强"], [
                "铜色点缀质感高级",
                "耳机位置偏离45度角要求",
                "背景渐变带有艺术化处理",
                "更适合品牌视觉而非白底图"
            ]),
            ("Flux FLUX.2 Pro", ["精确遵从", "真实感强"], [
                "严格遵守45度角构图",
                "景深效果精确",
                "材质反射极其真实",
                "可直接用于电商详情页"
            ]),
            ("Ideogram 3.0", ["可渲染文字", "构图正确"], [
                "材质真实感弱于Flux",
                "表面偏塑料感",
                "背景渐变较平面化",
                "可正确渲染产品名称文字"
            ])
        ],
        "Flux（精确遵从 + 真实质感）",
        "comparison-scenario-1-product-photography.png"
    )
    
    # Scenario 2: Illustration/Concept Art
    create_three_panel(
        "对比 2：插画 / 概念艺术",
        "Prompt：漂浮在云端的东方幻想城市，唐宋+蒸汽朋克融合，黄昏金色阳光，展翅凤凰，水彩插画风格，温暖诗意",
        [
            ("Midjourney v7", ["美学惊艳", "电影感"], [
                "金色阳光与云层互动极佳",
                "凤凰姿态充满动态张力",
                "水彩晕染恰到好处",
                "可直接作为游戏概念 art"
            ]),
            ("Flux FLUX.2 Pro", ["构图准确", "机械精细"], [
                "元素位置准确",
                "水彩手绘感不足",
                "色彩偏向写实",
                "风格融合略显生硬"
            ]),
            ("Ideogram 3.0", ["可添加文字", "平面插画"], [
                "构图基本满足要求",
                "风格化处理较弱",
                "细节密度低于 Midjourney",
                "可添加诗句/标题文字"
            ])
        ],
        "Midjourney v7（美学上限最高）",
        "comparison-scenario-2-illustration-concept.png"
    )
    
    # Scenario 3: Social Media
    create_three_panel(
        "对比 3：社交媒体图文",
        "Prompt：戏剧性山脉日出背景，中央粗体无衬线文字 \"START BEFORE YOU'RE READY\"，白色带投影，极简设计，1:1方形",
        [
            ("Midjourney v7", ["视觉冲击力", "金色调佳"], [
                "山脉日出视觉极佳",
                "文字几乎必定出错",
                "5次生成0次正确",
                "典型错误：字母粘连/错乱"
            ]),
            ("Flux FLUX.2 Pro", ["场景真实", "光影正确"], [
                "山脉场景真实感强",
                "文字约60-70%成功率",
                "样式控制不够精细",
                "需后期重新添加文字"
            ]),
            ("Ideogram 3.0", ["文字100%正确", "即产即用"], [
                "文字5次生成全部正确",
                "字体/阴影/居中精确",
                "可直接发布无需后期",
                "场景表现弱于前两者"
            ])
        ],
        "Ideogram 3.0（唯一满足核心需求）",
        "comparison-scenario-3-social-media.png"
    )
    
    # Scenario 4: Chinese Scene
    create_three_panel(
        "对比 4：中文场景",
        "Prompt：春节海报，红色背景，金色祥云，卡通小龙抱红包，上方\"龙年大吉\"，喜庆可爱，适合微信朋友圈",
        [
            ("Midjourney v7", ["中式美学", "色彩层次佳"], [
                "红色金色处理极佳",
                "卡通小龙形态可爱",
                "中文文字几乎无法正确渲染",
                "需 Photoshop 后期加字"
            ]),
            ("Flux FLUX.2 Pro", ["色彩准确", "构图准确"], [
                "祥云纹理物理感强",
                "小龙偏写实可爱",
                "中文成功率约20-30%",
                "语义理解良好"
            ]),
            ("Ideogram 3.0", ["中文85-90%", "平面设计"], [
                "红色祥云足够喜庆",
                "小龙最贴近可爱定位",
                "中文文字成功率最高",
                "字体/大小/位置控制精确"
            ])
        ],
        "Ideogram 3.0（中文文字决定性优势）",
        "comparison-scenario-4-chinese-scene.png"
    )
    
    # Overall chart
    create_overall_chart()
    
    print("All comparison images generated successfully!")
