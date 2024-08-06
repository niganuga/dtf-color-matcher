from PIL import Image
import json
from colorsys import rgb_to_hsv
import webcolors

def rgb_to_cmyk(r, g, b):
    if (r, g, b) == (0, 0, 0):
        return 0, 0, 0, 100
    c = 1 - r / 255
    m = 1 - g / 255
    y = 1 - b / 255
    k = min(c, m, y)
    c = (c - k) / (1 - k) * 100
    m = (m - k) / (1 - k) * 100
    y = (y - k) / (1 - k) * 100
    k = k * 100
    return round(c), round(m), round(y), round(k)

def rgb_to_hex(r, g, b):
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)

def closest_color_name(r, g, b):
    min_colors = {}
    for key, name in webcolors.CSS3_NAMES_TO_HEX.items():
        r_c, g_c, b_c = webcolors.hex_to_rgb(name)
        rd = (r_c - r) ** 2
        gd = (g_c - g) ** 2
        bd = (b_c - b) ** 2
        min_colors[(rd + gd + bd)] = key
    return min_colors[min(min_colors.keys())]

def extract_colors_from_image(image_path, swatch_size=20, gap=4):
    image = Image.open(image_path)
    width, height = image.size
    colors = []
    
    for y in range(0, height, swatch_size + gap):
        for x in range(0, width, swatch_size + gap):
            center_x = x + swatch_size // 2
            center_y = y + swatch_size // 2
            
            if center_x < width and center_y < height:
                r, g, b = image.getpixel((center_x, center_y))[:3]
                
                if (r, g, b) == (255, 255, 255):
                    continue
                
                cmyk = rgb_to_cmyk(r, g, b)
                hex_code = rgb_to_hex(r, g, b)
                color_name = closest_color_name(r, g, b)
                
                color = {
                    "id": hex_code.lstrip('#'),
                    "name": color_name,
                    "cmyk": list(cmyk),
                    "rgb": [r, g, b],
                    "hex": hex_code
                }
                colors.append(color)
    
    return colors

# Extract colors
image_path = 'color_chart.jpg'
extracted_colors = extract_colors_from_image(image_path)

# Remove duplicates
unique_colors = {color['hex']: color for color in extracted_colors}.values()

# Sort colors by hue
sorted_colors = sorted(unique_colors, key=lambda x: rgb_to_hsv(x['rgb'][0] / 255, x['rgb'][1] / 255, x['rgb'][2] / 255)[0])

# Write to JSON file
json_data = json.dumps(list(sorted_colors), indent=2)
with open('color-swatches.json', 'w') as f:
    f.write(json_data)

print(f"Extracted {len(sorted_colors)} unique colors and saved to color-swatches.json")