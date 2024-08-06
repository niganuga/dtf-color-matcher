import json
from colorsys import rgb_to_hsv, hsv_to_rgb

def rgb_to_cmyk(r, g, b):
    if (r, g, b) == (0, 0, 0):
        # black
        return 0, 0, 0, 100
    
    # RGB values from 0 to 1
    r, g, b = r/255.0, g/255.0, b/255.0
    
    # black key(K) color
    k = 1 - max(r, g, b)
    
    # CMY values
    c = (1-r-k)/(1-k) if (1-k) > 0 else 0
    m = (1-g-k)/(1-k) if (1-k) > 0 else 0
    y = (1-b-k)/(1-k) if (1-k) > 0 else 0
    
    # Convert to percentages
    return round(c*100, 2), round(m*100, 2), round(y*100, 2), round(k*100, 2)

# Load the JSON file
with open('color_swatches.json', 'r') as file:
    color_data = json.load(file)

# Add CMYK values to each color
for color in color_data:
    r, g, b = color['rgb']
    color['cmyk'] = list(rgb_to_cmyk(r, g, b))

# Save the updated JSON
with open('color_swatches_with_cmyk.json', 'w') as file:
    json.dump(color_data, file, indent=2)

print("CMYK values added and saved to color_swatches_with_cmyk.json")