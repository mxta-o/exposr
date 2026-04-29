import sys
import json
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import random
import datetime

def force_square_crop(image):
    width, height = image.size
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    return image.crop((left, top, left + min_dim, top + min_dim))

def adjust_colors(image):
    image = ImageEnhance.Color(image).enhance(0.85)
    image = ImageEnhance.Brightness(image).enhance(1.05)
    image = ImageEnhance.Contrast(image).enhance(0.90)
    return image

def add_random_imperfections(image):
    angle = random.uniform(-3, 3)
    image = image.rotate(angle, expand=False, fillcolor=(245, 240, 230))
    blur_radius = random.uniform(0, 1.2)
    image = image.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    exposure = random.uniform(0.85, 1.15)
    image = ImageEnhance.Brightness(image).enhance(exposure)
    return image

def add_grain(image, intensity=25):
    img_array = np.array(image, dtype=np.float32)
    grain = np.random.normal(0, intensity, img_array.shape)
    img_array = np.clip(img_array + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(img_array)

def add_light_leak(image):
    img_array = np.array(image, dtype=np.float32)
    h, w = img_array.shape[:2]

    corner = random.choice(["top-left", "top-right", "bottom-left", "bottom-right"])
    Y, X = np.mgrid[0:h, 0:w]

    if corner == "top-left":
        dist = np.sqrt((X / w) ** 2 + (Y / h) ** 2)
    elif corner == "top-right":
        dist = np.sqrt(((w - X) / w) ** 2 + (Y / h) ** 2)
    elif corner == "bottom-left":
        dist = np.sqrt((X / w) ** 2 + ((h - Y) / h) ** 2)
    else:
        dist = np.sqrt(((w - X) / w) ** 2 + ((h - Y) / h) ** 2)

    intensity = np.clip(1 - dist * 2, 0, 1)
    img_array[:, :, 0] = np.clip(img_array[:, :, 0] + intensity * 180 * 0.25, 0, 255)
    img_array[:, :, 1] = np.clip(img_array[:, :, 1] + intensity * 80 * 0.25, 0, 255)
    img_array[:, :, 2] = np.clip(img_array[:, :, 2] + intensity * 20 * 0.25, 0, 255)

    return Image.fromarray(img_array.astype(np.uint8))

def add_vignette(image):
    img_array = np.array(image, dtype=np.float32)
    h, w = img_array.shape[:2]
    Y, X = np.ogrid[:h, :w]
    mask = np.sqrt(((X - w / 2) / (w / 2)) ** 2 + ((Y - h / 2) / (h / 2)) ** 2)
    mask = 1 - np.clip(mask * 0.6, 0, 1)
    for c in range(3):
        img_array[:, :, c] *= mask
    return Image.fromarray(np.clip(img_array, 0, 255).astype(np.uint8))

def random_flash(image):
    if random.random() > 0.8:
        img_array = np.array(image, dtype=np.float32)
        h, w = img_array.shape[:2]
        Y, X = np.mgrid[0:h, 0:w]
        dist = np.sqrt((X - w / 2) ** 2 + (Y - h / 2) ** 2)
        flash_intensity = np.clip(1 - dist / (w * 0.6), 0, 1)
        flash = np.stack([
            flash_intensity * 255,
            flash_intensity * 255,
            flash_intensity * 240,
        ], axis=2)
        img_array = np.clip(img_array + flash * 0.4, 0, 255)
        return Image.fromarray(img_array.astype(np.uint8))
    return image

def add_polaroid_border(image):
    border_side = 30
    border_top = 30
    border_bottom = 80
    new_width = image.width + (border_side * 2)
    new_height = image.height + border_top + border_bottom
    polaroid = Image.new("RGB", (new_width, new_height), (245, 240, 230))
    polaroid.paste(image, (border_side, border_top))
    return polaroid

def add_timestamp(image):
    draw = ImageDraw.Draw(image)
    timestamp = datetime.datetime.now().strftime("%b %d, %Y  %I:%M %p")
    draw.text((40, image.height - 55), timestamp, fill=(210, 120, 50))
    return image

def process_image(input_path, output_path):
    image = Image.open(input_path).convert("RGB")
    image = force_square_crop(image)
    image = image.resize((600, 600), Image.LANCZOS)
    image = adjust_colors(image)
    image = add_random_imperfections(image)
    image = random_flash(image)
    image = add_grain(image, intensity=random.randint(15, 35))
    image = add_light_leak(image)
    image = add_vignette(image)
    image = add_polaroid_border(image)
    image = add_timestamp(image)
    image.save(output_path, "JPEG", quality=90)
    print(json.dumps({"success": True, "output": output_path}))

if __name__ == "__main__":
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    process_image(input_path, output_path)
